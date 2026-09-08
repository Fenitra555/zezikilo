// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // IMPORTANT : charge les variables .env

// Import des routes
const authRoutes = require('./api/auth.routes');
const deviceRoutes = require('./api/devices.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Routes de l'API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);      // <-- Route d'authentification
app.use('/api/devices', deviceRoutes); // <-- Route protégée

// Middleware de gestion d'erreurs (très important pour capturer les erreurs)
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur'
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

