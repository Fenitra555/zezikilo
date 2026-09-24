// src/api/permissions.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const User = require('../models/User');
const DevicePermission = require('../models/DevicePermission');

/**
 * Vérifie que l'utilisateur a un accès admin sur l'appareil
 * (propriétaire OU permission admin)
 */
async function checkAdminAccess(req, res, next) {
  const device = await Device.findById(req.params.deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      message: 'Appareil non trouvé'
    });
  }

  // Propriétaire = admin par défaut
  if (device.ownerId === req.user.id) {
    req.device = device;
    return next();
  }

  // Sinon, vérifier la permission admin
  const hasAdmin = await DevicePermission.hasPermission(
    req.params.deviceId,
    req.user.id,
    'admin'
  );
  if (!hasAdmin) {
    return res.status(403).json({
      status: 'error',
      message: 'Permission insuffisante (admin requis)'
    });
  }

  req.device = device;
  next();
}

/**
 * GET /api/devices/:deviceId/permissions
 * Lister les permissions d'un appareil
 */
router.get('/', auth, checkAdminAccess, async (req, res, next) => {
  try {
    const permissions = await DevicePermission.findByDevice(req.params.deviceId);

    res.status(200).json({
      status: 'success',
      data: permissions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:deviceId/permissions
 * Partager l'appareil avec un utilisateur (par email)
 */
router.post('/', auth, checkAdminAccess, async (req, res, next) => {
  try {
    const { email, permission = 'read' } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'L\'email de l\'utilisateur est requis'
      });
    }

    const validLevels = ['read', 'write', 'admin'];
    if (!validLevels.includes(permission)) {
      return res.status(400).json({
        status: 'error',
        message: `Niveau de permission invalide. Valeurs acceptées : ${validLevels.join(', ')}`
      });
    }

    // Trouver l'utilisateur cible
    const targetUser = await User.findByEmail(email);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur introuvable'
      });
    }

    // Ne pas donner une permission au propriétaire (il l'a déjà)
    if (targetUser.id === req.device.ownerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Le propriétaire a déjà un accès complet'
      });
    }

    // Vérifier si une permission existe déjà
    const existing = await DevicePermission.findByDeviceAndUser(
      req.params.deviceId,
      targetUser.id
    );
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet utilisateur a déjà accès à cet appareil'
      });
    }

    // Créer la permission
    const created = await DevicePermission.create({
      deviceId: req.params.deviceId,
      userId: targetUser.id,
      permission
    });

    res.status(201).json({
      status: 'success',
      data: {
        ...created,
        email: targetUser.email,
        fullName: targetUser.fullName
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/devices/:deviceId/permissions/:userId
 * Modifier le niveau de permission
 */
router.put('/:userId', auth, checkAdminAccess, async (req, res, next) => {
  try {
    const { permission } = req.body;

    const validLevels = ['read', 'write', 'admin'];
    if (!permission || !validLevels.includes(permission)) {
      return res.status(400).json({
        status: 'error',
        message: `Niveau invalide. Valeurs acceptées : ${validLevels.join(', ')}`
      });
    }

    // Interdire la modification du propriétaire
    if (req.params.userId === req.device.ownerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Impossible de modifier les droits du propriétaire'
      });
    }

    const existing = await DevicePermission.findByDeviceAndUser(
      req.params.deviceId,
      req.params.userId
    );
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission non trouvée'
      });
    }

    const updated = await DevicePermission.update(
      req.params.deviceId,
      req.params.userId,
      permission
    );

    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/devices/:deviceId/permissions/:userId
 * Révoquer l'accès d'un utilisateur
 */
router.delete('/:userId', auth, checkAdminAccess, async (req, res, next) => {
  try {
    // Interdire la suppression du propriétaire
    if (req.params.userId === req.device.ownerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Impossible de retirer le propriétaire'
      });
    }

    const existing = await DevicePermission.findByDeviceAndUser(
      req.params.deviceId,
      req.params.userId
    );
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission non trouvée'
      });
    }

    await DevicePermission.delete(req.params.deviceId, req.params.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;