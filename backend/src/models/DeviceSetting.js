// src/models/DeviceSetting.js
const db = require('../config/database');

class DeviceSetting {
  /**
   * Récupérer les paramètres d'un appareil
   * @param {string} deviceId
   * @returns {Promise<Object|null>}
   */
  static async findByDevice(deviceId) {
    return db('device_settings').where('deviceId', deviceId).first();
  }

  /**
   * Mettre à jour les paramètres d'un appareil
   * @param {string} deviceId
   * @param {Object} data - Champs à mettre à jour
   * @returns {Promise<Object>}
   */
  static async update(deviceId, data) {
    const [updated] = await db('device_settings')
      .where('deviceId', deviceId)
      .update({
        ...data,
        updatedAt: db.fn.now()
      })
      .returning('*');
    return updated;
  }
}

module.exports = DeviceSetting;