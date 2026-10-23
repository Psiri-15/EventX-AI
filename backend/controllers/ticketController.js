const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Get all tickets owned by logged-in attendee
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title date endDate venue bannerImage category status')
      .populate('booking', 'bookingReference totalAmount createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket by ticket code
// @route   GET /api/tickets/code/:code
// @access  Private
const getTicketByCode = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode: req.params.code })
      .populate('event')
      .populate('user', 'name email phone avatar')
      .populate('booking', 'bookingReference totalAmount createdAt')
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Only owner, organizer of the event, or admin can inspect ticket details
    const isOwner = ticket.user._id.toString() === req.user._id.toString();
    const isOrganizer = ticket.event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ticket.',
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate ticket QR/Code for event entry
// @route   POST /api/tickets/validate
// @access  Private (Organizer, Admin)
const validateTicket = async (req, res, next) => {
  try {
    let { ticketCode, eventId } = req.body;

    if (!ticketCode || ticketCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid ticket code or scan QR code.',
      });
    }

    ticketCode = ticketCode.trim();

    // Support scanned raw JSON if the camera scanned the full JSON payload
    if (ticketCode.startsWith('{') && ticketCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(ticketCode);
        if (parsed.code) ticketCode = parsed.code;
        if (parsed.eid && !eventId) eventId = parsed.eid;
      } catch (e) {
        // continue with raw string
      }
    }

    const ticket = await Ticket.findOne({ ticketCode })
      .populate('event', 'title date venue organizer status')
      .populate('user', 'name email phone avatar')
      .populate('booking', 'bookingReference createdAt');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        isValid: false,
        status: 'not_found',
        message: 'Invalid Ticket! No ticket found matching this code.',
      });
    }

    // Verify organizer permissions
    if (
      req.user.role !== 'admin' &&
      ticket.event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        isValid: false,
        status: 'unauthorized',
        message: 'You can only validate tickets for events you organize.',
      });
    }

    // Verify event matching if specific eventId provided
    if (eventId && ticket.event._id.toString() !== eventId.toString()) {
      return res.status(400).json({
        success: false,
        isValid: false,
        status: 'wrong_event',
        message: `This ticket belongs to another event: "${ticket.event.title}".`,
      });
    }

    // Status checks
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        isValid: false,
        status: 'cancelled',
        message: 'ENTRY REJECTED: This ticket was CANCELLED by the attendee or organizer.',
        ticket,
      });
    }

    if (ticket.status === 'checked_in') {
      const checkInTime = ticket.checkInDetails?.checkedInAt
        ? new Date(ticket.checkInDetails.checkedInAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'earlier';
      return res.status(400).json({
        success: false,
        isValid: false,
        status: 'already_used',
        message: `ALREADY USED: Ticket was already checked in at ${checkInTime}. Duplicate entry forbidden!`,
        ticket,
      });
    }

    // Ticket is valid and eligible for entry!
    res.status(200).json({
      success: true,
      isValid: true,
      status: 'valid',
      message: 'Ticket is VALID! Ready for check-in.',
      ticket: {
        id: ticket._id,
        ticketCode: ticket.ticketCode,
        ticketTierName: ticket.ticketTierName,
        price: ticket.price,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        venue: ticket.event.venue,
        attendeeName: ticket.user.name,
        attendeeEmail: ticket.user.email,
        bookingRef: ticket.booking?.bookingReference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Check-in for validated ticket
// @route   POST /api/tickets/check-in
// @access  Private (Organizer, Admin)
const checkInTicket = async (req, res, next) => {
  try {
    const { ticketCode, gate = 'Main Entrance', notes = '' } = req.body;

    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: 'Ticket code is required for check-in.',
      });
    }

    const ticket = await Ticket.findOne({ ticketCode: ticketCode.trim() })
      .populate('event', 'title organizer')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // Permission check
    if (
      req.user.role !== 'admin' &&
      ticket.event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in tickets for this event.',
      });
    }

    if (ticket.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been checked in.',
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check in a cancelled ticket.',
      });
    }

    ticket.status = 'checked_in';
    ticket.checkInDetails = {
      checkedInAt: new Date(),
      checkedInBy: req.user._id,
      gate,
      notes,
    };
    await ticket.save();

    // Send in-app notification to the attendee
    await Notification.create({
      user: ticket.user._id,
      title: 'Welcome to Event! 🎫',
      message: `Your ticket for "${ticket.event.title}" has been successfully checked in at ${gate}. Enjoy the event!`,
      type: 'ticket_checkin',
      link: '/my-tickets',
    });

    res.status(200).json({
      success: true,
      message: `Check-in confirmed for ${ticket.user.name} (${ticket.ticketTierName})!`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTickets,
  getTicketByCode,
  validateTicket,
  checkInTicket,
};
