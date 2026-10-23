const mongoose = require('mongoose');

const bookedTierItemSchema = new mongoose.Schema({
  ticketTierId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  tierName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    tierItems: {
      type: [bookedTierItemSchema],
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'demo_card', 'demo_upi', 'free'],
        default: 'demo_card',
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed',
      },
      transactionId: {
        type: String,
        required: true,
      },
      razorpayOrderId: {
        type: String,
        default: '',
      },
      razorpayPaymentId: {
        type: String,
        default: '',
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    cancellation: {
      cancelledAt: { type: Date },
      reason: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processed'],
        default: 'none',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
