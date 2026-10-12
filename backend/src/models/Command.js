// src/models/Command.js
const db = require('../config/database');
const crypto = require('crypto');

class Command {
  /**
   * Creer une commande
   */
  static async create(data) {
    const id = crypto.randomUUID();

    const [command] = await db('commands')
      .insert({
        id,
        deviceId: data.deviceId,
        userId: data.userId || null,
        command: data.command,
        params: JSON.stringify(data.params || {}),
        status: 'pending'
      })
      .returning('*');

    return command;
  }

  /**
   * Mettre a jour le statut
   */
  static async updateStatus(id, status, result = null) {
    const [updated] = await db('commands')
      .where('id', id)
      .update({
        status,
        result,
        sentAt: status === 'sent' ? db.fn.now() : undefined
      })
      .returning('*');
    return updated;
  }

  /**
   * Trouver une commande par ID
   */
  static async findById(id) {
    return db('commands').where('id', id).first();
  }

  /**
   * Lister les commandes d'un appareil
   */
  static async findByDevice(deviceId, limit = 50) {
    return db('commands')
      .where('deviceId', deviceId)
      .orderBy('createdAt', 'desc')
      .limit(limit);
  }
}

module.exports = Command;