const express = require('express');
const router = express.Router();
const {
  getEventReviews,
  createReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/event/:eventId', getEventReviews);
router.post('/', protect, createReview);

module.exports = router;
