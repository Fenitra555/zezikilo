// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import des routes
const authRoutes = require('./api/auth.routes');
const deviceRoutes = require('./api/devices.routes');
const measurementRoutes = require('./api/measurements.routes');
const settingsRoutes = require('./api/settings.routes');
const alertRoutes = require('./api/alerts.routes');
const permissionRoutes = require('./api/permissions.routes');

// Import WebSocket et errorHandler
const initWebSocket = require('./ws');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes spécifiques (avec :deviceId) AVANT les routes génériques
app.use('/api/devices/:deviceId/permissions', permissionRoutes);
app.use('/api/devices/:deviceId/alerts', alertRoutes);
app.use('/api/devices/:deviceId/settings', settingsRoutes);
app.use('/api/devices/:deviceId/measurements', measurementRoutes);

// Routes génériques
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

// Middleware 404 (routes non trouvées)
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée : ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
});

// Middleware d'erreurs (DOIT être en dernier)
app.use(errorHandler);

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
const io = initWebSocket(server);

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket prêt sur ws://localhost:${PORT}`);
});