const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

// @desc    Get platform-wide admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      attendeesCount,
      organizersCount,
      totalEvents,
      pendingEventsCount,
      approvedEventsCount,
      rejectedEventsCount,
      bookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'attendee' }),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'rejected' }),
      Booking.find().lean(),
    ]);

    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

    const totalTicketsSold = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalQuantity || 0),
      0
    );
    const totalPlatformRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );
    const totalRefundedAmount = cancelledBookings.reduce(
      (sum, b) => sum + (b.cancellation?.refundAmount || 0),
      0
    );

    // Group revenue by category
    const events = await Event.find().lean();
    const eventCategoryMap = {};
    events.forEach((e) => {
      eventCategoryMap[e._id.toString()] = e.category;
    });

    const categoryRevenueMap = {};
    confirmedBookings.forEach((b) => {
      const cat = eventCategoryMap[b.event?.toString()] || 'other';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + b.totalAmount;
    });

    const categoryDistribution = Object.keys(categoryRevenueMap).map((cat) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      revenue: categoryRevenueMap[cat],
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        attendeesCount,
        organizersCount,
        totalEvents,
        pendingEventsCount,
        approvedEventsCount,
        rejectedEventsCount,
        totalBookings: bookings.length,
        confirmedBookingsCount: confirmedBookings.length,
        cancelledBookingsCount: cancelledBookings.length,
        totalTicketsSold,
        totalPlatformRevenue,
        totalRefundedAmount,
      },
      categoryDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for moderation (pending, approved, rejected)
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEvents = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (search && search.trim() !== '') {
      query.title = new RegExp(search.trim(), 'i');
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .populate('organizer', 'name email organization avatar phone')
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

// @desc    Approve, reject, or feature an event
// @route   PUT /api/admin/events/:id/status
// @access  Private (Admin)
const updateEventStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, featured } = req.body;

    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (status) {
      if (!['approved', 'rejected', 'pending', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value.',
        });
      }
      event.status = status;
    }

    if (featured !== undefined) {
      event.featured = Boolean(featured);
    }

    await event.save();

    // Send notification to the organizer
    if (status === 'approved') {
      await Notification.create({
        user: event.organizer._id,
        title: 'Event Approved! 🎉',
        message: `Your event "${event.title}" has been approved by the admin team and is now live on EventX AI.`,
        type: 'event_approved',
        link: `/events/${event._id}`,
      });
    } else if (status === 'rejected') {
      await Notification.create({
        user: event.organizer._id,
        title: 'Event Review Update',
        message: `Your event "${event.title}" was not approved. Reason: ${
          rejectionReason || 'Does not meet listing guidelines'
        }`,
        type: 'event_rejected',
        link: '/organizer/events',
      });
    }

    res.status(200).json({
      success: true,
      message: `Event status updated to ${event.status}.`,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Inactive) or update role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own administrator account.',
      });
    }

    if (role && ['attendee', 'organizer', 'admin'].includes(role)) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('event', 'title category date venue')
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

module.exports = {
  getAdminStats,
  getAllEvents,
  updateEventStatus,
  getAllUsers,
  updateUser,
  getAllBookings,
};
