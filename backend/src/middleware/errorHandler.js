// src/middleware/errorHandler.js

/**
 * Middleware de gestion d'erreurs centralisé
 * Format uniforme : { status: 'error', message, code?, details? }
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  // Log côté serveur
  console.error(`❌ [${statusCode}] ${req.method} ${req.path} :`, err.message);

  // En développement : afficher la stack
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur',
    ...(err.code && { code: err.code }),
    ...(err.details && { details: err.details }),
    ...(isDev && statusCode === 500 && { stack: err.stack })
  });
}

module.exports = errorHandler;