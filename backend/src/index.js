// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./api/auth.routes');
const deviceRoutes = require('./api/devices.routes');   // <-- vérifier cette ligne
const measurementRoutes = require('./api/measurements.routes');
const settingsRoutes = require('./api/settings.routes');
const http = require('http');
const initWebSocket = require('./ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Créer le serveur HTTP à partir de l'app Express
const server = http.createServer(app);

// Initialiser Socket.IO sur ce serveur
const io = initWebSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);                   // <-- vérifier cette ligne
app.use('/api/devices/:deviceId/measurements', measurementRoutes);
app.use('/api/devices/:deviceId/settings', settingsRoutes);

// Gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur'
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket prêt sur ws://localhost:${PORT}`);
});