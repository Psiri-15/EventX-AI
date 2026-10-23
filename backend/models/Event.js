const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ticket tier name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  perks: {
    type: [String],
    default: [],
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'technology',
        'workshops',
        'cultural',
        'music',
        'sports',
        'college',
        'business',
        'other',
      ],
      lowercase: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify the start date and time'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify the end date and time'],
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      isOnline: { type: Boolean, default: false },
      meetingUrl: { type: String, default: '' },
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    ticketTiers: {
      type: [ticketTierSchema],
      validate: {
        validator: function (tiers) {
          return tiers && tiers.length > 0;
        },
        message: 'At least one ticket tier must be provided',
      },
    },
    totalCapacity: {
      type: Number,
      default: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    cancellationPolicy: {
      allowed: { type: Boolean, default: true },
      cutoffHours: { type: Number, default: 24 }, // Allowed up to 24 hrs before event
      refundPercentage: { type: Number, default: 100 },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totalCapacity before save
eventSchema.pre('save', function () {
  if (this.ticketTiers && this.ticketTiers.length > 0) {
    this.totalCapacity = this.ticketTiers.reduce((acc, tier) => acc + tier.capacity, 0);
    this.totalSold = this.ticketTiers.reduce((acc, tier) => acc + (tier.soldCount || 0), 0);
  }
});

// Indexes for high performance search, filter and recommendations
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, status: 1, date: 1 });
eventSchema.index({ 'venue.city': 1 });

module.exports = mongoose.model('Event', eventSchema);
