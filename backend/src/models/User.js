// src/models/User.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class User {
  static async findByEmail(email) {
    return db('users').where('email', email).first();
  }

  static async findById(id) {
    return db('users').where('id', id).first();
  }

  static async create(data) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);
    const id = uuidv4();

    await db('users').insert({
      id,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role || 'user'
    });

    const user = await db('users').where('id', id).first();
    delete user.passwordHash;
    return user;
  }

  static async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }

  static async update(id, data) {
    await db('users').where('id', id).update(data);
    const updated = await db('users').where('id', id).first();
    delete updated.passwordHash;
    return updated;
  }
}

module.exports = User;

