// src/services/auth.service.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(data) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('Cet email est déjà utilisé');
      error.status = 400;
      throw error;
    }

    // Créer l'utilisateur (le mot de passe est hashé dans le modèle)
    const user = await User.create(data);
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' } // Le token expire dans 7 jours
    );

    return { user, token };
  }

  /**
   * Connexion d'un utilisateur existant
   */
  static async login(email, password) {
    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Email ou mot de passe incorrect');
      error.status = 401;
      throw error;
    }

    // Vérifier le mot de passe
    const isValid = await User.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Email ou mot de passe incorrect');
      error.status = 401;
      throw error;
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Ne pas renvoyer le hash du mot de passe
    delete user.passwordHash;

    return { user, token };
  }
}

module.exports = AuthService;

