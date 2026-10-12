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
const commandRoutes = require('./api/commands.routes');

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

// Routes specifiques (avec :deviceId) AVANT les routes generiques
app.use('/api/devices/:deviceId/permissions', permissionRoutes);
app.use('/api/devices/:deviceId/alerts', alertRoutes);
app.use('/api/devices/:deviceId/settings', settingsRoutes);
app.use('/api/devices/:deviceId/measurements', measurementRoutes);
app.use('/api/devices/:deviceId/commands', commandRoutes);

// Routes generiques
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

// Middleware 404
app.use((req, res, next) => {
  const error = new Error(`Route non trouvee : ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
});

// Middleware d'erreurs (DOIT etre en dernier)
app.use(errorHandler);

// Creer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
const io = initWebSocket(server);

// Rendre io accessible depuis les routes via req.app.locals
app.locals.io = io;

// Demarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur backend demarre sur http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket pret sur ws://localhost:${PORT}`);
});