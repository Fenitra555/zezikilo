// src/ws/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
 * Initialise le serveur WebSocket
 * @param {http.Server} httpServer - Serveur HTTP d'Express
 * @returns {Server} Instance Socket.IO
 */
function initWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',        // En production : restreindre au domaine du frontend
      methods: ['GET', 'POST']
    }
  });

  // Middleware d'authentification JWT
  // Le client doit envoyer le token dans `auth.token` lors de la connexion
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Token manquant'));
    }

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

    // Déconnexion
    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket déconnecté : user=${socket.user.email} (raison=${reason})`);
    });
  });

  return io;
}

module.exports = initWebSocket;