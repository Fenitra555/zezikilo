// src/api/commands.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const Command = require('../models/Command');

const VALID_COMMANDS = [
  'motor-start',
  'motor-stop',
  'fan-start',
  'fan-stop',
  'reset-cycle',
  'update-settings'
];

/**
 * Verifie que l'utilisateur a acces a l'appareil
 */
async function checkDeviceAccess(req, res, next) {
  const device = await Device.findById(req.params.deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      message: 'Appareil non trouve'
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
 * Verifie qu'un ESP32 est connecte dans la room de l'appareil
 */
function isDeviceOnline(io, deviceId) {
  const room = `device:${deviceId}`;
  const clientsInRoom = io.sockets.adapter.rooms.get(room);
  if (!clientsInRoom) return false;

  for (const clientId of clientsInRoom) {
    const clientSocket = io.sockets.sockets.get(clientId);
    if (clientSocket && clientSocket.clientType === 'device') {
      return true;
    }
  }
  return false;
}

/**
 * POST /api/devices/:deviceId/commands
 * Envoyer une commande a un appareil
 */
router.post('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const { command, params = {} } = req.body;

    if (!command) {
      return res.status(400).json({
        status: 'error',
        message: 'La commande est requise'
      });
    }

    if (!VALID_COMMANDS.includes(command)) {
      return res.status(400).json({
        status: 'error',
        message: `Commande invalide. Valeurs acceptees : ${VALID_COMMANDS.join(', ')}`
      });
    }

    // Recuperer l'instance Socket.IO
    const io = req.app.locals.io;
    if (!io) {
      return res.status(500).json({
        status: 'error',
        message: 'WebSocket non initialise'
      });
    }

    // Verifier que l'ESP32 est connecte
    if (!isDeviceOnline(io, req.params.deviceId)) {
      return res.status(503).json({
        status: 'error',
        message: 'Appareil hors ligne'
      });
    }

    // Creer la commande en base
    const created = await Command.create({
      deviceId: req.params.deviceId,
      userId: req.user.id,
      command,
      params
    });

    // Mettre a jour le statut
    await Command.updateStatus(created.id, 'sent');

    // Relayer a l'ESP32 via WebSocket
    const room = `device:${req.params.deviceId}`;
    const relayed = {
      type: 'command',
      deviceId: req.device.serialNumber,
      commandId: created.id,
      command,
      params,
      timestamp: Date.now()
    };
    io.to(room).emit('command', relayed);

    console.log(`📤 [REST] Commande ${command} relayee a ${req.device.serialNumber} (id=${created.id})`);

    res.status(202).json({
      status: 'success',
      data: {
        commandId: created.id,
        command,
        status: 'sent',
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/devices/:deviceId/commands
 * Historique des commandes
 */
router.get('/', auth, checkDeviceAccess, async (req, res, next) => {
  try {
    const commands = await Command.findByDevice(req.params.deviceId);
    res.status(200).json({
      status: 'success',
      data: commands
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;