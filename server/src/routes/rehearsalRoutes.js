const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createRehearsal,
  getBandRehearsals,
  getRehearsal,
  updateRehearsal,
  deleteRehearsal,
  updateAttendance,
  getUserRehearsals,
} = require('../controllers/rehearsalController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Routes for /api/bands/:bandId/rehearsals
router.route('/')
  .get(getBandRehearsals)
  .post(createRehearsal);

// Create a separate router for /api/rehearsals
const rehearsalRouter = express.Router();

// Protect all routes
rehearsalRouter.use(protect);

// Route for getting current user's rehearsals
rehearsalRouter.route('/me').get(getUserRehearsals);

// Routes for specific rehearsal
rehearsalRouter.route('/:id')
  .get(getRehearsal)
  .put(updateRehearsal)
  .delete(deleteRehearsal);

// Route for updating attendance
rehearsalRouter.route('/:id/attendance').post(updateAttendance);

module.exports = {
  bandRehearsalRouter: router,
  rehearsalRouter
};