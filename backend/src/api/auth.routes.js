// src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation basique (on peut ajouter Zod plus tard)
    if (!email || !password || !fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, mot de passe et nom complet sont requis'
      });
    }

    const result = await AuthService.register({ email, password, fullName });
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error); // Passe au middleware de gestion d'erreurs
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email et mot de passe sont requis'
      });
    }

    const result = await AuthService.login(email, password);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
