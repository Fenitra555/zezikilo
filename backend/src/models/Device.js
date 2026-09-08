// src/models/Device.js
const db = require('../config/database');
const crypto = require('crypto');

class Device {
  /**
   * Générer une clé API aléatoire
   * @returns {string}
   */
  static generateApiKey() {
    return 'sk_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Trouver un appareil par son serialNumber
   * @param {string} serialNumber
   * @returns {Promise<Object|null>}
   */
  static async findBySerial(serialNumber) {
    return db('devices').where('serialNumber', serialNumber).first();
  }

  /**
   * Trouver un appareil par son ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db('devices').where('id', id).first();
  }

  /**
   * Récupérer tous les appareils d’un utilisateur (avec permissions)
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static async findByUser(userId) {
    return db('devices')
      .select('devices.*', 'device_permissions.permission')
      .leftJoin('device_permissions', 'devices.id', 'device_permissions.deviceId')
      .where('devices.ownerId', userId)
      .orWhere('device_permissions.userId', userId);
  }

  /**
   * Créer un nouvel appareil
   * @param {Object} data - { serialNumber, alias?, ownerId }
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const apiKey = this.generateApiKey();
    const [device] = await db('devices')
      .insert({
        serialNumber: data.serialNumber,
        alias: data.alias || data.serialNumber,
        ownerId: data.ownerId,
        apiKey: apiKey,
        firmwareVersion: '1.0.0'
      })
      .returning(['id', 'serialNumber', 'alias', 'ownerId', 'apiKey', 'firmwareVersion', 'createdAt']);

    // Créer automatiquement les paramètres par défaut
    await db('device_settings').insert({
      deviceId: device.id
    });

    // Donner la permission admin à l’utilisateur propriétaire
    await db('device_permissions').insert({
      deviceId: device.id,
      userId: data.ownerId,
      permission: 'admin'
    });

    return device;
  }

  /**
   * Mettre à jour un appareil
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const [updated] = await db('devices')
      .where('id', id)
      .update(data)
      .returning(['id', 'serialNumber', 'alias', 'updatedAt']);
    return updated;
  }

  /**
   * Supprimer un appareil
   * @param {string} id
   * @returns {Promise<number>} nombre de lignes supprimées
   */
  static async delete(id) {
    return db('devices').where('id', id).del();
  }
}

module.exports = Device;

