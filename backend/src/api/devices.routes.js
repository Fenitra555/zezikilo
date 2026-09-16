// src/api/devices.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');

/**
 * GET /api/devices
 * Liste des appareils de l'utilisateur connecté
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const devices = await Device.findByUser(req.user.id);
    res.status(200).json({
      status: 'success',
      data: devices
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices
 * Ajouter un nouvel appareil (association via serialNumber)
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const { serialNumber, alias } = req.body;

    if (!serialNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Le numéro de série est requis'
      });
    }

    // Vérifier si l'appareil existe déjà
    const existing = await Device.findBySerial(serialNumber);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet appareil est déjà associé'
      });
    }

    const device = await Device.create({
      serialNumber,
      alias,
      ownerId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: device
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/devices/:deviceId
 * Détails d'un appareil spécifique
 */
router.get('/:deviceId', auth, async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.deviceId);

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Appareil non trouvé'
      });
    }

    // Vérifier que l'utilisateur a le droit d'y accéder
    if (device.ownerId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission insuffisante'
      });
    }

    res.status(200).json({
      status: 'success',
      data: device
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/devices/:deviceId
 * Modifier un appareil (alias)
 */
router.put('/:deviceId', auth, async (req, res, next) => {
  try {
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

    const updated = await Device.update(req.params.deviceId, {
      alias: req.body.alias || device.alias
    });

    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/devices/:deviceId
 * Supprimer un appareil (dissocier)
 */
router.delete('/:deviceId', auth, async (req, res, next) => {
  try {
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

    await Device.delete(req.params.deviceId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;