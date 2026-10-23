const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

// @desc    Get organizer dashboard statistics
// @route   GET /api/organizer/stats
// @access  Private (Organizer, Admin)
const getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // Fetch all events by this organizer
    const events = await Event.find({ organizer: organizerId }).lean();
    const eventIds = events.map((e) => e._id);

    const totalEvents = events.length;
    const now = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;
    const completedEvents = events.filter((e) => new Date(e.endDate) < now).length;

    // Fetch bookings for these events
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: { $ne: 'cancelled' },
    }).lean();

    const totalTicketsSold = bookings.reduce((sum, b) => sum + (b.totalQuantity || 0), 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Sales by event breakdown
    const eventSalesMap = {};
    events.forEach((e) => {
      eventSalesMap[e._id.toString()] = {
        title: e.title,
        ticketsSold: 0,
        revenue: 0,
        capacity: e.totalCapacity,
      };
    });

    bookings.forEach((b) => {
      const eid = b.event.toString();
      if (eventSalesMap[eid]) {
        eventSalesMap[eid].ticketsSold += b.totalQuantity;
        eventSalesMap[eid].revenue += b.totalAmount;
      }
    });

    const salesByEvent = Object.keys(eventSalesMap).map((id) => ({
      eventId: id,
      ...eventSalesMap[id],
    }));

    // Monthly / Daily revenue trend
    const revenueTimeline = {};
    bookings.forEach((b) => {
      const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
      revenueTimeline[dateKey] = (revenueTimeline[dateKey] || 0) + b.totalAmount;
    });

    const revenueChartData = Object.keys(revenueTimeline)
      .sort()
      .map((date) => ({
        date,
        revenue: revenueTimeline[date],
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalTicketsSold,
        totalRevenue,
      },
      salesByEvent,
      revenueChartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events created by logged in organizer
// @route   GET /api/organizer/events
// @access  Private (Organizer, Admin)
const getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendees list for a specific event
// @route   GET /api/organizer/events/:id/attendees
// @access  Private (Organizer of this event, Admin)
const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view attendees for this event.',
      });
    }

    const tickets = await Ticket.find({ event: req.params.id })
      .populate('user', 'name email phone avatar')
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

module.exports = {
  getOrganizerStats,
  getOrganizerEvents,
  getEventAttendees,
};
