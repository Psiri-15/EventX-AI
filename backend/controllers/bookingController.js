const crypto = require('crypto');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { generateTicketQR } = require('../services/qrService');
const { createOrder, verifyPayment } = require('../services/paymentService');

// @desc    Initiate checkout / prepare order
// @route   POST /api/bookings/checkout
// @access  Private (Attendee, Organizer, Admin)
const prepareCheckout = async (req, res, next) => {
  try {
    const { eventId, items } = req.body;

    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId and valid ticket items.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.status !== 'approved' || !event.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This event is currently not open for ticket reservations.',
      });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reserve tickets for past events.',
      });
    }

    // Verify inventory and calculate accurate server-side price
    let totalQuantity = 0;
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const tier = event.ticketTiers.find((t) => t.name === item.tierName);
      if (!tier) {
        return res.status(400).json({
          success: false,
          message: `Ticket tier "${item.tierName}" does not exist for this event.`,
        });
      }

      const available = tier.capacity - (tier.soldCount || 0);
      const requestedQty = Number(item.quantity);

      if (requestedQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1.',
        });
      }

      if (available < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Only ${available} tickets available for "${tier.name}". You requested ${requestedQty}.`,
        });
      }

      const subtotal = tier.price * requestedQty;
      totalQuantity += requestedQty;
      totalAmount += subtotal;

      validatedItems.push({
        ticketTierId: tier._id,
        tierName: tier.name,
        quantity: requestedQty,
        unitPrice: tier.price,
        subtotal,
      });
    }

    // Generate Order (Razorpay order or Demo order)
    const orderData = await createOrder({
      amount: totalAmount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
      },
      items: validatedItems,
      totalQuantity,
      totalAmount,
      order: orderData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and finalize ticket booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      eventId,
      items,
      paymentMethod = 'demo_card',
      paymentDetails = {},
    } = req.body;

    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data provided.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Event is either unavailable or has not been approved.',
      });
    }

    // Perform atomic inventory decrement with rollback safeguard
    const incrementedTiers = [];
    let totalQuantity = 0;
    let totalAmount = 0;
    const tierItems = [];

    try {
      for (const item of items) {
        const qty = Number(item.quantity);
        if (qty <= 0) continue;

        const tier = event.ticketTiers.find((t) => t.name === item.tierName);
        if (!tier) {
          throw new Error(`Tier ${item.tierName} was not found on this event.`);
        }

        // Atomic check and increment in DB:
        // Ensures tier capacity is not exceeded concurrently!
        const updatedEvent = await Event.findOneAndUpdate(
          {
            _id: eventId,
            'ticketTiers.name': item.tierName,
            'ticketTiers.soldCount': { $lte: tier.capacity - qty },
          },
          {
            $inc: {
              'ticketTiers.$.soldCount': qty,
              totalSold: qty,
            },
          },
          { new: true }
        );

        if (!updatedEvent) {
          throw new Error(
            `Insufficient tickets remaining for "${item.tierName}". Please adjust quantity.`
          );
        }

        incrementedTiers.push({ tierName: item.tierName, quantity: qty });

        const subtotal = tier.price * qty;
        totalQuantity += qty;
        totalAmount += subtotal;

        tierItems.push({
          ticketTierId: tier._id,
          tierName: tier.name,
          quantity: qty,
          unitPrice: tier.price,
          subtotal,
        });
      }
    } catch (inventoryError) {
      // Rollback any tiers incremented before the failure
      for (const inc of incrementedTiers) {
        await Event.findOneAndUpdate(
          { _id: eventId, 'ticketTiers.name': inc.tierName },
          {
            $inc: {
              'ticketTiers.$.soldCount': -inc.quantity,
              totalSold: -inc.quantity,
            },
          }
        );
      }
      return res.status(400).json({
        success: false,
        message: inventoryError.message,
      });
    }

    // Verify payment
    let transactionId = paymentDetails.transactionId;
    let paymentStatus = 'completed';

    if (paymentMethod === 'razorpay') {
      const isValid = verifyPayment(paymentDetails);
      if (!isValid) {
        // Rollback inventory on failed payment
        for (const inc of incrementedTiers) {
          await Event.findOneAndUpdate(
            { _id: eventId, 'ticketTiers.name': inc.tierName },
            {
              $inc: {
                'ticketTiers.$.soldCount': -inc.quantity,
                totalSold: -inc.quantity,
              },
            }
          );
        }
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Invalid gateway signature.',
        });
      }
      transactionId = paymentDetails.razorpay_payment_id || `RPY_${Date.now()}`;
    } else {
      // Demo Payment Mode verification
      transactionId =
        transactionId ||
        `DEMO_TXN_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    }

    // Create unique booking reference
    const bookingReference = `EX-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    // Create Booking Document
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      event: event._id,
      tierItems,
      totalQuantity,
      totalAmount,
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId,
        razorpayOrderId: paymentDetails.razorpay_order_id || '',
        razorpayPaymentId: paymentDetails.razorpay_payment_id || '',
        paidAt: new Date(),
      },
      status: 'confirmed',
    });

    // Generate individual Ticket records with distinct QR codes
    const createdTickets = [];
    for (const item of tierItems) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto
          .randomBytes(2)
          .toString('hex')
          .toUpperCase()}`;

        const qrDataURL = await generateTicketQR({
          ticketCode,
          eventId: event._id.toString(),
          bookingRef: booking.bookingReference,
        });

        const ticket = await Ticket.create({
          ticketCode,
          booking: booking._id,
          event: event._id,
          user: req.user._id,
          ticketTierName: item.tierName,
          price: item.unitPrice,
          qrCodeData: qrDataURL,
          status: 'valid',
        });

        createdTickets.push(ticket);
      }
    }

    // Send in-app notification to attendee
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${event.title}" (${totalQuantity} ticket${
        totalQuantity > 1 ? 's' : ''
      }) is confirmed. Ref: ${bookingReference}`,
      type: 'booking_confirmation',
      link: '/my-tickets',
    });

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Digital QR tickets have been generated.',
      booking,
      ticketsCount: createdTickets.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('event', 'title date endDate venue bannerImage category status cancellationPolicy')
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email phone')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check permission
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    // Fetch related tickets
    const tickets = await Ticket.find({ booking: booking._id }).lean();

    res.status(200).json({
      success: true,
      booking,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking according to cancellation policy
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;

    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure only booking owner or admin can cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    const event = booking.event;
    const policy = event.cancellationPolicy || {
      allowed: true,
      cutoffHours: 24,
      refundPercentage: 100,
    };

    if (!policy.allowed && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This event does not permit ticket cancellations.',
      });
    }

    // Check cutoff hours
    const eventTime = new Date(event.date).getTime();
    const currentTime = Date.now();
    const hoursRemaining = (eventTime - currentTime) / (1000 * 60 * 60);

    if (hoursRemaining < policy.cutoffHours && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cancellations must be requested at least ${policy.cutoffHours} hours prior to the event. Only ${Math.max(
          0,
          Math.round(hoursRemaining)
        )} hours remain.`,
      });
    }

    // Calculate refund amount
    const refundPercentage = policy.refundPercentage || 100;
    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

    // Release ticket capacity back to the event
    for (const item of booking.tierItems) {
      await Event.findOneAndUpdate(
        { _id: event._id, 'ticketTiers.name': item.tierName },
        {
          $inc: {
            'ticketTiers.$.soldCount': -item.quantity,
            totalSold: -item.quantity,
          },
        }
      );
    }

    // Mark tickets as cancelled
    await Ticket.updateMany(
      { booking: booking._id },
      { status: 'cancelled' }
    );

    // Update booking document
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'processed' : 'none',
    };
    if (booking.payment) {
      booking.payment.status = refundAmount > 0 ? 'refunded' : booking.payment.status;
    }
    await booking.save();

    // Create notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingReference} for "${event.title}" has been cancelled. Refund of ₹${refundAmount} has been marked as processed.`,
      type: 'booking_cancellation',
      link: '/my-bookings',
    });

    res.status(200).json({
      success: true,
      message: `Booking successfully cancelled. Refund of ₹${refundAmount} (${refundPercentage}%) has been processed.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  prepareCheckout,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
