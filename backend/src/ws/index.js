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

  // Vérifier que c'est bien l'appareil qui envoie ses propres données
  if (socket.clientType !== 'device' || socket.device.serialNumber !== serialNumber) {
    return socket.emit('error', { message: 'Non autorisé à envoyer cet état' });
  }

  try {
    // 1. Insérer dans la base
    const measurement = {
      id: crypto.randomUUID(),
      deviceId: socket.device.id,   // UUID interne
      temperature: data.temperature,
      humidity: data.humidity,
      motor: data.motor || false,
      fan: data.fan || false,
      phase: data.phase,
      emergency: data.emergency || false,
      timestamp: timestamp || Date.now()
    };

    await db('measurements').insert(measurement);

    // 2. Mettre à jour lastSyncAt
    await db('devices')
      .where('id', socket.device.id)
      .update({ lastSyncAt: db.fn.now() });

    // 3. Diffuser aux clients abonnés à la room
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

    // ---- Messages côté ESP32 ----

    socket.on('device-state', (payload) => {
      handleDeviceState(io, socket, payload);
    });

    // ---- Déconnexion ----

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket déconnecté : ${identity} (raison=${reason})`);
    });
  });

  return io;
}

module.exports = initWebSocket;