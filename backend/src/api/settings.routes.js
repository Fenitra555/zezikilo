// src/api/settings.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const DeviceSetting = require('../models/DeviceSetting');

/**
 * Vérifie que l'utilisateur a accès à l'appareil
 */
async function checkDeviceAccess(req, res, next) {
  const device = await Device.findById(req.params.deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      message: 'Appareil non trouvé'
    });
  }
  if (device.ownerId !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Permission insuffisante'
    });
  }
  req.device = device;
  next();
}

/**
 * GET /api/devices/:deviceId/settings
 * Récupérer les paramètres de régulation
 */
router.get('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const settings = await DeviceSetting.findByDevice(req.params.deviceId);
    if (!settings) {
      return res.status(404).json({
        status: 'error',
        message: 'Paramètres non trouvés'
      });
    }
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/devices/:deviceId/settings
 * Mettre à jour les paramètres (champs optionnels)
 */
router.put('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    // Liste des champs autorisés
    const allowedFields = [
      'tempMaxUrgence',
      'tempMaxThermophile',
      'tempMinThermophile',
      'humiditeMin',
      'humiditeMax',
      'tempFinCycle',
      'dureeBrassagePhase1',
      'dureeBrassagePhase2',
      'dureeBrassagePhase3',
      'intervallePhase1',
      'intervallePhase2',
      'intervallePhase3',
      'tempTransitionP1P2',
      'tempTransitionP2P3',
      'dureeTransitionP2P3'
    ];

    // Filtrer les champs reçus
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Aucun champ valide à mettre à jour'
      });
    }

    const updated = await DeviceSetting.update(req.params.deviceId, updateData);

    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;