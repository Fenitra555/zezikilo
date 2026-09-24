// src/api/alerts.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const Alert = require('../models/Alert');

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
 * GET /api/devices/:deviceId/alerts
 * Lister les alertes d'un appareil
 */
router.get('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const { acknowledged, limit } = req.query;

    const options = { limit };
    if (acknowledged !== undefined) {
      options.acknowledged = acknowledged === 'true';
    }

    const alerts = await Alert.findByDevice(req.params.deviceId, options);

    res.status(200).json({
      status: 'success',
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:deviceId/alerts/:alertId/acknowledge
 * Acquitter une alerte
 */
router.post('/:alertId/acknowledge', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);

    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée'
      });
    }

    if (alert.deviceId !== req.params.deviceId) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée pour cet appareil'
      });
    }

    const updated = await Alert.acknowledge(req.params.alertId, req.user.id);

    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;