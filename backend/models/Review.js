const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per booking
reviewSchema.index({ user: 1, event: 1 }, { unique: true });

// Static method to recalculate average rating for an event
reviewSchema.statics.getAverageRating = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Event').findByIdAndUpdate(eventId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await this.model('Event').findByIdAndUpdate(eventId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating event rating:', err);
  }
};

// Call getAverageRating after save and after delete
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.event);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.event);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
