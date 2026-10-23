const Event = require('../models/Event');
const Booking = require('../models/Booking');

/**
 * Get personalized event recommendations for a user
 * @param {string} userId
 * @param {Array<string>} userInterests
 * @param {number} limit
 */
const getRecommendations = async (userId, userInterests = [], limit = 6) => {
  const currentDate = new Date();

  // Find user's past bookings to analyze category affinities
  let bookedEventIds = [];
  let userBookedCategories = [];

  if (userId) {
    const bookings = await Booking.find({ user: userId, status: { $ne: 'cancelled' } })
      .populate('event', 'category _id')
      .lean();

    bookedEventIds = bookings.map((b) => b.event?._id?.toString()).filter(Boolean);
    userBookedCategories = bookings
      .map((b) => b.event?.category)
      .filter(Boolean);
  }

  // Fetch all upcoming, approved, published events
  const candidates = await Event.find({
    status: 'approved',
    isPublished: true,
    date: { $gte: currentDate },
    _id: { $nin: bookedEventIds },
  })
    .populate('organizer', 'name organization avatar')
    .lean();

  if (!candidates || candidates.length === 0) {
    // If no upcoming unbooked events, fetch general approved upcoming events
    return await Event.find({
      status: 'approved',
      isPublished: true,
      date: { $gte: currentDate },
    })
      .sort({ featured: -1, averageRating: -1, totalSold: -1 })
      .limit(limit)
      .populate('organizer', 'name organization avatar')
      .lean();
  }

  // Scoring algorithm:
  // 1. Interest match score: +40 pts if event category matches user's selected interests
  // 2. Tag match score: +10 pts per matching tag with user interests
  // 3. Past booking category history: +30 pts if event matches categories the user previously booked
  // 4. Rating score: rating * 6 (up to 30 pts)
  // 5. Popularity score: (totalSold / totalCapacity) * 20 (up to 20 pts)
  // 6. Featured bonus: +15 pts
  const scoredEvents = candidates.map((event) => {
    let score = 0;
    const matchReasons = [];

    const normCategory = (event.category || '').toLowerCase();
    const normInterests = userInterests.map((i) => i.toLowerCase());

    // Interest match
    if (normInterests.includes(normCategory)) {
      score += 40;
      matchReasons.push(`Matches your interest in ${event.category}`);
    }

    // Tag match
    if (Array.isArray(event.tags)) {
      event.tags.forEach((tag) => {
        if (normInterests.includes(tag.toLowerCase())) {
          score += 10;
        }
      });
    }

    // Historical booking category affinity
    if (userBookedCategories.includes(normCategory)) {
      score += 30;
      if (!matchReasons.includes(`Based on your previous ${event.category} bookings`)) {
        matchReasons.push(`Based on your previous ${event.category} bookings`);
      }
    }

    // Rating contribution
    if (event.averageRating > 0) {
      score += event.averageRating * 6;
    }

    // Popularity velocity
    if (event.totalCapacity > 0) {
      const fillRatio = (event.totalSold || 0) / event.totalCapacity;
      score += fillRatio * 20;
      if (fillRatio > 0.5) {
        matchReasons.push('Trending & selling fast');
      }
    }

    // Featured boost
    if (event.featured) {
      score += 15;
      matchReasons.push('Editorially featured event');
    }

    if (matchReasons.length === 0) {
      matchReasons.push('Popular upcoming event in your region');
    }

    return {
      ...event,
      recommendationScore: Math.round(score),
      recommendationReason: matchReasons[0],
    };
  });

  // Sort descending by calculated recommendationScore
  scoredEvents.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredEvents.slice(0, limit);
};

module.exports = { getRecommendations };
