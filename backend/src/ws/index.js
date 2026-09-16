// src/ws/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const db = require('../config/database');

/**
 * Vérifie qu'un utilisateur a accès à un appareil
 * @param {string} userId
 * @param {string} deviceId
 * @returns {Promise<boolean>}
 */
async function userCanAccessDevice(userId, deviceId) {
  // Propriétaire ?
  const device = await db('devices').where('id', deviceId).first();
  if (!device) return false;
  if (device.ownerId === userId) return true;

  // Sinon, vérifier les permissions
  const permission = await db('device_permissions')
    .where({ deviceId, userId })
    .first();
  return !!permission;
}

/**
 * Initialise le serveur WebSocket
 * @param {http.Server} httpServer - Serveur HTTP d'Express
 * @returns {Server} Instance Socket.IO
 */
function initWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware d'authentification JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token manquant'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;   // { id, email, role }
      next();
    } catch (err) {
      return next(new Error('Token invalide'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket connecté : user=${socket.user.email} (socketId=${socket.id})`);

    /**
     * Le client demande à rejoindre la room d'un appareil
     */
    socket.on('subscribe', async ({ deviceId }) => {
      if (!deviceId) {
        return socket.emit('error', { message: 'deviceId requis' });
      }

      const allowed = await userCanAccessDevice(socket.user.id, deviceId);
      if (!allowed) {
        console.log(`⛔ Accès refusé : user=${socket.user.email} → device=${deviceId}`);
        return socket.emit('error', { message: 'Accès refusé à cet appareil' });
      }

      const room = `device:${deviceId}`;
      socket.join(room);
      console.log(`📥 ${socket.user.email} a rejoint la room ${room}`);
      socket.emit('subscribed', { deviceId });
    });

    /**
     * Le client quitte la room d'un appareil
     */
    socket.on('unsubscribe', ({ deviceId }) => {
      if (!deviceId) return;
      const room = `device:${deviceId}`;
      socket.leave(room);
      console.log(`📤 ${socket.user.email} a quitté la room ${room}`);
    });

    /**
     * Déconnexion
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket déconnecté : user=${socket.user.email} (raison=${reason})`);
    });
  });

  return io;
}

module.exports = initWebSocket;