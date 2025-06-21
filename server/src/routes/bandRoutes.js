const express = require('express');
const router = express.Router();
const {
  createBand,
  getBands,
  getBand,
  updateBand,
  deleteBand,
  addBandMember,
  removeBandMember,
  updateBandMember,
} = require('../controllers/bandController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Band routes
router.route('/')
  .get(getBands)
  .post(createBand);

router.route('/:id')
  .get(getBand)
  .put(updateBand)
  .delete(deleteBand);

// Band member routes
router.route('/:id/members')
  .post(addBandMember);

router.route('/:id/members/:userId')
  .put(updateBandMember)
  .delete(removeBandMember);

module.exports = router;