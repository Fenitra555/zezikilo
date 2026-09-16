// src/models/Measurement.js
const db = require('../config/database');
const crypto = require('crypto');

class Measurement {
  /**
   * Créer une nouvelle mesure
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const id = crypto.randomUUID();

    const [measurement] = await db('measurements')
      .insert({
        id,
        deviceId: data.deviceId,
        temperature: data.temperature,
        humidity: data.humidity,
        motor: data.motor || false,
        fan: data.fan || false,
        phase: data.phase,
        emergency: data.emergency || false,
        timestamp: data.timestamp || Date.now(),
        syncId: data.syncId || null
      })
      .returning('*');

    return measurement;
  }

  /**
   * Récupérer l'historique des mesures d'un appareil avec pagination et filtres
   * @param {string} deviceId
   * @param {Object} options - { limit, offset, startDate, endDate }
   * @returns {Promise<Array>}
   */
  static async findByDevice(deviceId, options = {}) {
    const limit = parseInt(options.limit) || 100;
    const offset = parseInt(options.offset) || 0;

    let query = db('measurements')
      .where('deviceId', deviceId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    if (options.startDate) {
      query = query.where('timestamp', '>=', options.startDate);
    }
    if (options.endDate) {
      query = query.where('timestamp', '<=', options.endDate);
    }

    return query;
  }

  /**
   * Compter le nombre total de mesures d'un appareil
   * @param {string} deviceId
   * @param {Object} options - { startDate, endDate }
   * @returns {Promise<number>}
   */
  static async countByDevice(deviceId, options = {}) {
    let query = db('measurements').where('deviceId', deviceId).count('* as total');

    if (options.startDate) {
      query = query.where('timestamp', '>=', options.startDate);
    }
    if (options.endDate) {
      query = query.where('timestamp', '<=', options.endDate);
    }

    const result = await query.first();
    return parseInt(result.total);
  }

  /**
   * Récupérer la dernière mesure d'un appareil
   * @param {string} deviceId
   * @returns {Promise<Object|null>}
   */
  static async findLatest(deviceId) {
    return db('measurements')
      .where('deviceId', deviceId)
      .orderBy('timestamp', 'desc')
      .first();
  }
}

module.exports = Measurement;