/**
 * CONCEPT 1 – Error-Handling Middleware
 *
 * Error-handling middleware has FOUR parameters: (err, req, res, next)
 * Express identifies it as error middleware because of the 4th parameter.
 * It must be registered LAST in the middleware stack (after all routes).
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;
  }
}

// Global error handler (4 params = error middleware)
const errorHandler = (err, req, res, next) => {
  console.error(`\n❌ ERROR: ${err.message}`);
  console.error(`   Status: ${err.statusCode || 500}`);
  console.error(`   Path:   ${req.method} ${req.path}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message:   err.message || 'Internal Server Error',
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

// 404 handler — placed before errorHandler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message:   `Route not found: ${req.method} ${req.path}`,
      statusCode: 404,
      suggestion: 'Try GET http://localhost:3000/api'
    }
  });
};

module.exports = { AppError, errorHandler, notFoundHandler };
