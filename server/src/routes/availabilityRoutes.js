const express = require('express');
const router = express.Router();
const {
  setAvailability,
  getUserAvailability,
  getBandAvailability,
  updateAvailability,
  deleteAvailability,
  findOptimalTimes
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Routes for band-specific availability
router.route('/band/:bandId')
  .get(getUserAvailability)
  .post(setAvailability);

router.route('/band/:bandId/all')
  .get(getBandAvailability);

router.route('/band/:bandId/optimal')
  .get(findOptimalTimes);

// Routes for specific availability records
router.route('/:id')
  .put(updateAvailability)
  .delete(deleteAvailability);

module.exports = router;