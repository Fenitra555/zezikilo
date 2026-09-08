// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token dans le header Authorization
 */
const auth = (req, res, next) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token d\'authentification manquant'
      });
    }

    // Le format attendu est "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Format du token invalide. Utilisez "Bearer <token>"'
      });
    }

    const token = parts[1];

    // Vérifier la validité du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur décodées à la requête
    req.user = decoded;
    
    // Passer à la suite
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expiré'
      });
    }
    // Autre erreur
    return res.status(500).json({
      status: 'error',
      message: 'Erreur d\'authentification'
    });
  }
};

module.exports = auth;

