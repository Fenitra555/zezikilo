// src/api/measurements.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const Measurement = require('../models/Measurement');

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
 * GET /api/devices/:deviceId/measurements
 * Historique paginé et filtrable des mesures
 */
router.get('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const { limit, offset, startDate, endDate } = req.query;
    const deviceId = req.params.deviceId;

    const measurements = await Measurement.findByDevice(deviceId, {
      limit,
      offset,
      startDate,
      endDate
    });

    const total = await Measurement.countByDevice(deviceId, { startDate, endDate });

    res.status(200).json({
      status: 'success',
      data: {
        measurements,
        pagination: {
          limit: parseInt(limit) || 100,
          offset: parseInt(offset) || 0,
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/:deviceId/measurements
 * Ajouter une mesure manuellement (pour tests uniquement, l'ESP32 utilise WebSocket)
 */
router.post('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const { temperature, humidity, motor, fan, phase, emergency, timestamp } = req.body;

    if (temperature === undefined || humidity === undefined || phase === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Les champs temperature, humidity et phase sont requis'
      });
    }

    const measurement = await Measurement.create({
      deviceId: req.params.deviceId,
      temperature,
      humidity,
      motor,
      fan,
      phase,
      emergency,
      timestamp
    });

    res.status(201).json({
      status: 'success',
      data: measurement
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;