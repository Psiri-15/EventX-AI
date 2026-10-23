const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketTierName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'checked_in', 'cancelled'],
      default: 'valid',
      index: true,
    },
    checkInDetails: {
      checkedInAt: { type: Date },
      checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      gate: { type: String, default: 'Main Entrance' },
      notes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
