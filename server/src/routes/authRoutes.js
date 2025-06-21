const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;