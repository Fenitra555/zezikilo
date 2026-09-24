// src/models/DevicePermission.js
const db = require('../config/database');
const crypto = require('crypto');

class DevicePermission {
  /**
   * Créer une permission
   * @param {Object} data - { deviceId, userId, permission }
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const id = crypto.randomUUID();

    const [permission] = await db('device_permissions')
      .insert({
        id,
        deviceId: data.deviceId,
        userId: data.userId,
        permission: data.permission || 'read'
      })
      .returning('*');

    return permission;
  }

  /**
   * Trouver une permission par deviceId + userId
   * @param {string} deviceId
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  static async findByDeviceAndUser(deviceId, userId) {
    return db('device_permissions')
      .where({ deviceId, userId })
      .first();
  }

  /**
   * Lister les permissions d'un appareil (avec infos user)
   * @param {string} deviceId
   * @returns {Promise<Array>}
   */
  static async findByDevice(deviceId) {
    return db('device_permissions')
      .select(
        'device_permissions.id',
        'device_permissions.deviceId',
        'device_permissions.userId',
        'device_permissions.permission',
        'device_permissions.createdAt',
        'users.email',
        'users.fullName'
      )
      .leftJoin('users', 'device_permissions.userId', 'users.id')
      .where('device_permissions.deviceId', deviceId);
  }

  /**
   * Mettre à jour le niveau de permission
   * @param {string} deviceId
   * @param {string} userId
   * @param {string} permission
   * @returns {Promise<Object>}
   */
  static async update(deviceId, userId, permission) {
    const [updated] = await db('device_permissions')
      .where({ deviceId, userId })
      .update({ permission })
      .returning('*');
    return updated;
  }

  /**
   * Supprimer une permission
   * @param {string} deviceId
   * @param {string} userId
   * @returns {Promise<number>}
   */
  static async delete(deviceId, userId) {
    return db('device_permissions')
      .where({ deviceId, userId })
      .del();
  }

  /**
   * Vérifier si un utilisateur a au moins un certain niveau de permission
   * @param {string} deviceId
   * @param {string} userId
   * @param {string} requiredLevel - 'read' | 'write' | 'admin'
   * @returns {Promise<boolean>}
   */
  static async hasPermission(deviceId, userId, requiredLevel = 'read') {
    const perm = await this.findByDeviceAndUser(deviceId, userId);
    if (!perm) return false;

    const levels = { read: 1, write: 2, admin: 3 };
    return levels[perm.permission] >= levels[requiredLevel];
  }
}

module.exports = DevicePermission;