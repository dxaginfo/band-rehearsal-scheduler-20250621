const AppError = require('../utils/AppError');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    error = new AppError('Database error', 500);
  }

  // JWT token errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // Return formatted error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};