const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Get reviews for an event
// @route   GET /api/reviews/event/:eventId
// @access  Public
const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review for an event
// @route   POST /api/reviews
// @access  Private (Attendee)
const createReview = async (req, res, next) => {
  try {
    const { eventId, rating, title, comment } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId, rating (1-5), and comments.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.',
      });
    }

    // Verify user actually booked this event
    const booking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: { $ne: 'cancelled' },
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'Only verified attendees with a confirmed booking can review this event.',
      });
    }

    // Check if user already reviewed this event
    const existingReview = await Review.findOne({
      user: req.user._id,
      event: eventId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this event.',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      event: eventId,
      booking: booking._id,
      rating: Number(rating),
      title: title || '',
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventReviews,
  createReview,
};
