const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all events with search, filtering, and sorting
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      sortBy = 'date',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      status: 'approved',
      isPublished: true,
    };

    // Text Search in title, description, or tags
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    // City filter
    if (city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'all cities') {
      query['venue.city'] = new RegExp(city.trim(), 'i');
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else {
      // Default: show upcoming events or all approved
      // query.date = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }

    // Price filter (based on minimum ticket tier price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
      query['ticketTiers.price'] = priceFilter;
    }

    // Sorting
    let sortOptions = { date: 1 };
    if (sortBy === 'popularity') {
      sortOptions = { totalSold: -1, averageRating: -1 };
    } else if (sortBy === 'price_asc') {
      sortOptions = { 'ticketTiers.0.price': 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { 'ticketTiers.0.price': -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('organizer', 'name organization avatar')
        .lean(),
      Event.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      status: 'approved',
      isPublished: true,
      featured: true,
    })
      .sort({ date: 1 })
      .limit(6)
      .populate('organizer', 'name organization avatar')
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

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email organization bio avatar phone')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with this ID',
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      date,
      endDate,
      venue,
      bannerImage,
      ticketTiers,
      tags,
      cancellationPolicy,
      featured,
    } = req.body;

    if (!title || !shortDescription || !description || !category || !date || !endDate || !ticketTiers) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory event details.',
      });
    }

    // Admin-created events are automatically approved; organizers submit for admin review
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const event = await Event.create({
      title,
      shortDescription,
      description,
      category,
      date,
      endDate,
      venue,
      bannerImage:
        bannerImage ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      ticketTiers,
      tags: Array.isArray(tags) ? tags : [],
      cancellationPolicy: cancellationPolicy || { allowed: true, cutoffHours: 24, refundPercentage: 100 },
      featured: req.user.role === 'admin' ? Boolean(featured) : false,
      organizer: req.user._id,
      status: initialStatus,
    });

    // Notify admins if submitted by an organizer
    if (initialStatus === 'pending') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: 'New Event Awaiting Approval',
          message: `Organizer "${req.user.name}" submitted "${event.title}" for approval.`,
          type: 'system',
          link: '/admin',
        });
      }
    }

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'approved'
          ? 'Event published successfully.'
          : 'Event submitted successfully! It is pending administrator approval.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private (Organizer of this event, Admin)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Verify ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.',
      });
    }

    // Prevent modifying ticket tier soldCount directly via general update
    const updates = { ...req.body };
    delete updates.totalSold;
    delete updates.averageRating;
    delete updates.totalReviews;

    // If an organizer edits an event, keep status pending if required or approved
    if (req.user.role !== 'admin') {
      delete updates.featured; // Only admins can feature
    }

    event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer of this event, Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
