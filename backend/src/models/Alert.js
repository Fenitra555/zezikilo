// src/models/Alert.js
const db = require('../config/database');
const crypto = require('crypto');

class Alert {
  /**
   * Créer une alerte
   * @param {Object} data - { deviceId, type, message, timestamp? }
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const id = crypto.randomUUID();

    const [alert] = await db('alerts')
      .insert({
        id,
        deviceId: data.deviceId,
        type: data.type,
        message: data.message,
        acknowledged: false,
        timestamp: data.timestamp || Date.now()
      })
      .returning('*');

    return alert;
  }

  /**
   * Trouver une alerte par ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db('alerts').where('id', id).first();
  }

  /**
   * Lister les alertes d'un appareil avec filtres
   * @param {string} deviceId
   * @param {Object} options - { acknowledged, limit }
   * @returns {Promise<Array>}
   */
  static async findByDevice(deviceId, options = {}) {
    const limit = parseInt(options.limit) || 50;

    let query = db('alerts')
      .where('deviceId', deviceId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (options.acknowledged !== undefined) {
      query = query.where('acknowledged', options.acknowledged);
    }

    return query;
  }

  /**
   * Acquitter une alerte
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async acknowledge(id, userId) {
    const [updated] = await db('alerts')
      .where('id', id)
      .update({
        acknowledged: true,
        acknowledgedBy: userId
      })
      .returning('*');

    return updated;
  }
}

module.exports = Alert;