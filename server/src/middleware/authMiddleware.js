const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('./asyncHandler');

/**
 * Middleware to protect routes - verify JWT token and add user to request
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'devjwtsecret123'
    );

    // Get user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

/**
 * Middleware to restrict routes to specific user roles
 * @param {...String} roles - Roles to allow
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `User role ${req.user.role} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};