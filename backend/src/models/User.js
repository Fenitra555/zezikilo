// src/models/User.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
  /**
   * Trouver un utilisateur par son email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    return db('users').where('email', email).first();
  }

  /**
   * Trouver un utilisateur par son ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db('users').where('id', id).first();
  }

  /**
   * Créer un nouvel utilisateur
   * @param {Object} data - { email, password, fullName, role? }
   * @returns {Promise<Object>}
   */
  static async create(data) {
    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Générer un UUID côté Node.js (car SQLite ne le fait pas nativement)
    const id = crypto.randomUUID();

    const [user] = await db('users')
      .insert({
        id,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role || 'user'
      })
      .returning(['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt']);

    return user;
  }

  /**
   * Vérifier le mot de passe
   * @param {string} plainPassword
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }

  /**
   * Mettre à jour le profil utilisateur
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const [updated] = await db('users')
      .where('id', id)
      .update(data)
      .returning(['id', 'email', 'fullName', 'role', 'updatedAt']);
    return updated;
  }
}

module.exports = User;