// src/api/devices.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');

// GET /api/devices - Liste des appareils de l'utilisateur connecté
router.get('/', auth, async (req, res, next) => {
  try {
    // req.user.id est disponible grâce au middleware auth
    const devices = await Device.findByUser(req.user.id);
    res.status(200).json({
      status: 'success',
      data: devices
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/devices - Ajouter un nouvel appareil (protégé)
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

module.exports = router;

