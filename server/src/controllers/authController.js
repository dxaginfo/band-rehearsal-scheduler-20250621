const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devjwtsecret123', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new AppError('User with that email already exists', 400);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check if user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.checkPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update fields
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findByPk(req.user.id);
  
  // Check current password
  const isMatch = await user.checkPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});