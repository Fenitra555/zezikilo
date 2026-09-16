// src/ws/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const db = require('../config/database');
const crypto = require('crypto');

/**
 * Vérifie qu'un utilisateur a accès à un appareil
 */
async function userCanAccessDevice(userId, deviceId) {
  const device = await db('devices').where('id', deviceId).first();
  if (!device) return false;
  if (device.ownerId === userId) return true;

  const permission = await db('device_permissions')
    .where({ deviceId, userId })
    .first();
  return !!permission;
}

/**
 * Vérifie qu'un device (ESP32) est actuellement connecté dans une room
 */
function isDeviceOnlineInRoom(io, room) {
  const clientsInRoom = io.sockets.adapter.rooms.get(room);
  if (!clientsInRoom) return false;

  for (const clientId of clientsInRoom) {
    const clientSocket = io.sockets.sockets.get(clientId);
    if (clientSocket && clientSocket.clientType === 'device') {
      return true;
    }
  }
  return false;
}

/**
 * Middleware d'authentification (JWT pour utilisateurs, apiKey pour ESP32)
 */
async function authenticate(socket, next) {
  const { token, serialNumber, apiKey } = socket.handshake.auth || {};

  // Cas 1 : Utilisateur (frontend)
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      socket.clientType = 'user';
      return next();
    } catch (err) {
      return next(new Error('Token invalide'));
    }
  }

  // Cas 2 : ESP32
  if (serialNumber && apiKey) {
    try {
      const device = await db('devices')
        .where({ serialNumber, apiKey })
        .first();
      if (!device) {
        return next(new Error('Appareil inconnu'));
      }
      socket.device = device;
      socket.clientType = 'device';
      return next();
    } catch (err) {
      return next(new Error('Erreur d\'authentification appareil'));
    }
  }

  return next(new Error('Authentification requise'));
}

/**
 * Traite un message device-state envoyé par l'ESP32
 */
async function handleDeviceState(io, socket, payload) {
  const { deviceId: serialNumber, timestamp, data } = payload;

  if (socket.clientType !== 'device' || socket.device.serialNumber !== serialNumber) {
    return socket.emit('error', { message: 'Non autorisé à envoyer cet état' });
  }

  try {
    const measurement = {
      id: crypto.randomUUID(),
      deviceId: socket.device.id,
      temperature: data.temperature,
      humidity: data.humidity,
      motor: data.motor || false,
      fan: data.fan || false,
      phase: data.phase,
      emergency: data.emergency || false,
      timestamp: timestamp || Date.now()
    };

    await db('measurements').insert(measurement);

    await db('devices')
      .where('id', socket.device.id)
      .update({ lastSyncAt: db.fn.now() });

    const room = `device:${socket.device.id}`;
    io.to(room).emit('device-state', {
      type: 'device-state',
      deviceId: socket.device.id,
      serialNumber: socket.device.serialNumber,
      timestamp: measurement.timestamp,
      data
    });

    console.log(`📊 Mesure enregistrée et diffusée (device=${socket.device.serialNumber})`);
  } catch (err) {
    console.error('❌ Erreur device-state :', err.message);
    socket.emit('error', { message: 'Erreur lors du traitement de la mesure' });
  }
}

/**
 * Traite une commande envoyée par un utilisateur
 */
async function handleCommand(io, socket, payload) {
  if (socket.clientType !== 'user') {
    return socket.emit('error', { message: 'Réservé aux utilisateurs' });
  }

  const { deviceId, command, params = {} } = payload;

  if (!deviceId || !command) {
    return socket.emit('error', { message: 'deviceId et command requis' });
  }

  const allowed = await userCanAccessDevice(socket.user.id, deviceId);
  if (!allowed) {
    return socket.emit('error', { message: 'Accès refusé à cet appareil' });
  }

  const device = await db('devices').where('id', deviceId).first();
  if (!device) {
    return socket.emit('error', { message: 'Appareil introuvable' });
  }

  const room = `device:${deviceId}`;

  // Vérifier qu'un device (ESP32) est bien connecté dans la room
  if (!isDeviceOnlineInRoom(io, room)) {
    return socket.emit('error', { message: 'Appareil hors ligne' });
  }

  const commandId = crypto.randomUUID();

  // Insérer la commande dans la base
  await db('commands').insert({
    id: commandId,
    deviceId,
    userId: socket.user.id,
    command,
    params: JSON.stringify(params),
    status: 'sent',
    sentAt: db.fn.now()
  });

  // Relayer à l'ESP32
  const relayed = {
    type: 'command',
    deviceId: device.serialNumber,
    commandId,
    command,
    params,
    timestamp: Date.now()
  };
  io.to(room).emit('command', relayed);

  console.log(`📤 Commande ${command} relayée à ${device.serialNumber} (id=${commandId})`);

  // Confirmer au frontend
  socket.emit('command-sent', { commandId, command });
}

/**
 * Traite un command-ack envoyé par l'ESP32
 */
async function handleCommandAck(io, socket, payload) {
  if (socket.clientType !== 'device') {
    return socket.emit('error', { message: 'Réservé aux appareils' });
  }

  const { commandId, status, result } = payload;

  if (!commandId) {
    return socket.emit('error', { message: 'commandId requis' });
  }

  try {
    await db('commands')
      .where('id', commandId)
      .update({
        status: status === 'success' ? 'acknowledged' : 'failed',
        result: result || null,
        acknowledgedAt: db.fn.now()
      });

    const command = await db('commands').where('id', commandId).first();

    if (command) {
      const room = `device:${command.deviceId}`;
      io.to(room).emit('command-ack', {
        type: 'command-ack',
        deviceId: command.deviceId,
        commandId,
        status,
        result: result || null,
        timestamp: Date.now()
      });
    }

    console.log(`✅ Commande ${commandId} acquittée (status=${status})`);
  } catch (err) {
    console.error('❌ Erreur command-ack :', err.message);
    socket.emit('error', { message: 'Erreur lors du traitement de l\'acquittement' });
  }
}

/**
 * Initialise le serveur WebSocket
 */
function initWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.use(authenticate);

  io.on('connection', (socket) => {
    const identity = socket.clientType === 'user'
      ? `user=${socket.user.email}`
      : `device=${socket.device.serialNumber}`;
    console.log(`🔌 WebSocket connecté : ${identity} (socketId=${socket.id}, type=${socket.clientType})`);

    // ---- ESP32 : rejoindre automatiquement sa room ----
    if (socket.clientType === 'device') {
      const room = `device:${socket.device.id}`;
      socket.join(room);
      console.log(`📥 ESP32 ${socket.device.serialNumber} a rejoint la room ${room}`);
    }

    // ---- Messages côté utilisateur ----

    socket.on('subscribe', async ({ deviceId }) => {
      if (socket.clientType !== 'user') {
        return socket.emit('error', { message: 'Réservé aux utilisateurs' });
      }
      if (!deviceId) {
        return socket.emit('error', { message: 'deviceId requis' });
      }

      const allowed = await userCanAccessDevice(socket.user.id, deviceId);
      if (!allowed) {
        return socket.emit('error', { message: 'Accès refusé à cet appareil' });
      }

      const room = `device:${deviceId}`;
      socket.join(room);
      console.log(`📥 ${socket.user.email} a rejoint la room ${room}`);
      socket.emit('subscribed', { deviceId });
    });

    socket.on('unsubscribe', ({ deviceId }) => {
      if (!deviceId) return;
      const room = `device:${deviceId}`;
      socket.leave(room);
      console.log(`📤 ${socket.user.email} a quitté la room ${room}`);
    });

    socket.on('command', (payload) => {
      handleCommand(io, socket, payload);
    });

    // ---- Messages côté ESP32 ----

    socket.on('device-state', (payload) => {
      handleDeviceState(io, socket, payload);
    });

    socket.on('command-ack', (payload) => {
      handleCommandAck(io, socket, payload);
    });

    // ---- Déconnexion ----

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket déconnecté : ${identity} (raison=${reason})`);
    });
  });

  return io;
}

module.exports = initWebSocket;