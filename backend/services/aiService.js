const Event = require('../models/Event');
const Booking = require('../models/Booking');

/**
 * Chat with EventX AI assistant
 */
const handleChat = async ({ message, history = [], user = null }) => {
  const query = (message || '').trim();
  const lowerQuery = query.toLowerCase();

  // Fetch live upcoming approved events for context
  const liveEvents = await Event.find({
    status: 'approved',
    isPublished: true,
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(10)
    .lean();

  // Check if Gemini API Key is configured
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      // Direct call to Gemini API REST endpoint
      const eventContextSummary = liveEvents
        .map(
          (e) =>
            `- ${e.title} (${e.category}): on ${new Date(e.date).toDateString()} at ${e.venue.name}, ${e.venue.city}. Tickets from ₹${
              e.ticketTiers[0]?.price || 0
            }. Available: ${e.totalCapacity - e.totalSold} tickets left.`
        )
        .join('\n');

      const systemPrompt = `You are EventX AI, an intelligent, helpful, and concise event booking assistant for the EventX AI platform.
Current live upcoming events on the platform:
${eventContextSummary}

Platform policies:
- Attendees can book tickets instantly with card, UPI, or demo checkout.
- QR tickets are automatically generated after booking confirmation and available in "My Tickets".
- Organizers validate QR codes at event gates using the QR Scanner in their dashboard.
- Cancellation is permitted up to 24 hours prior to the event start time.
- Attendees can review events after attending.

Respond politely, accurately, and concisely. If recommending events, mention the title, date, venue, and starting price.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          reply: data.candidates[0].content.parts[0].text,
          provider: 'Gemini AI',
          matchedEvents: [],
        };
      }
    } catch (apiError) {
      console.warn('[AI Service] Gemini API call failed, using intelligent rule-based engine:', apiError.message);
    }
  }

  // --- Intelligent Rule-Based & Real Live Data Query Engine Fallback ---

  // 1. Check for specific category queries
  const categories = ['technology', 'workshops', 'cultural', 'music', 'sports', 'college', 'business'];
  const matchedCategory = categories.find((cat) => lowerQuery.includes(cat));

  if (matchedCategory) {
    const catEvents = liveEvents.filter((e) => (e.category || '').toLowerCase() === matchedCategory);
    if (catEvents.length > 0) {
      const titles = catEvents.map(
        (e) => `• **${e.title}** on ${new Date(e.date).toLocaleDateString()} at ${e.venue.name}, ${e.venue.city} (Starts at ₹${e.ticketTiers[0]?.price || 0})`
      );
      return {
        reply: `Here are upcoming **${matchedCategory.toUpperCase()}** events currently scheduled on EventX AI:\n\n${titles.join('\n')}\n\nYou can click on any event in the Discover page to choose ticket tiers and reserve your spot!`,
        provider: 'Rule-Based Contextual AI',
        matchedEvents: catEvents,
      };
    } else {
      return {
        reply: `There are no upcoming events in the **${matchedCategory}** category right now. Stay tuned as organizers post new events frequently, or explore other categories like Technology, Cultural, or Workshops!`,
        provider: 'Rule-Based Contextual AI',
        matchedEvents: [],
      };
    }
  }

  // 2. Cancellation and refund policy inquiries
  if (lowerQuery.includes('cancel') || lowerQuery.includes('refund') || lowerQuery.includes('policy')) {
    return {
      reply: `**EventX AI Cancellation Policy:**\n• You can cancel tickets directly from your **"My Bookings"** page.\n• Full cancellations are eligible up to **24 hours prior** to the scheduled event start time.\n• Once cancelled, the ticket inventory is automatically released and your refund status will update in your dashboard.`,
      provider: 'Rule-Based Contextual AI',
      matchedEvents: [],
    };
  }

  // 3. QR Ticket and entry inquiries
  if (lowerQuery.includes('ticket') || lowerQuery.includes('qr') || lowerQuery.includes('entry') || lowerQuery.includes('gate') || lowerQuery.includes('download')) {
    return {
      reply: `**How Ticket Booking & QR Verification Works:**\n1. Select your event and desired ticket tier (e.g. VIP, General Admission, Early Bird).\n2. Complete payment via Demo Card/UPI or Razorpay.\n3. Instantly receive your unique **Digital QR Ticket** in **"My Tickets"**.\n4. Show the QR code at the event gate, where organizers scan and validate entry in real time using the EventX Organizer Scanner.`,
      provider: 'Rule-Based Contextual AI',
      matchedEvents: [],
    };
  }

  // 4. Price / cheap / free / budget inquiries
  if (lowerQuery.includes('free') || lowerQuery.includes('price') || lowerQuery.includes('cheap') || lowerQuery.includes('cost')) {
    const sortedByPrice = [...liveEvents].sort((a, b) => (a.ticketTiers[0]?.price || 0) - (b.ticketTiers[0]?.price || 0));
    const budgetList = sortedByPrice.slice(0, 3).map(
      (e) => `• **${e.title}** - ₹${e.ticketTiers[0]?.price || 0} (${e.venue.city})`
    );
    return {
      reply: `Here are some of the best-value upcoming events:\n\n${budgetList.join('\n')}\n\nCheck the Discover page to filter by custom price ranges!`,
      provider: 'Rule-Based Contextual AI',
      matchedEvents: sortedByPrice.slice(0, 3),
    };
  }

  // 5. City or venue search
  const cities = ['mumbai', 'bangalore', 'bengaluru', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata'];
  const matchedCity = cities.find((city) => lowerQuery.includes(city));
  if (matchedCity) {
    const cityEvents = liveEvents.filter((e) => (e.venue.city || '').toLowerCase().includes(matchedCity));
    if (cityEvents.length > 0) {
      const list = cityEvents.map(
        (e) => `• **${e.title}** at ${e.venue.name} on ${new Date(e.date).toLocaleDateString()}`
      );
      return {
        reply: `Found upcoming events in **${matchedCity.toUpperCase()}**:\n\n${list.join('\n')}`,
        provider: 'Rule-Based Contextual AI',
        matchedEvents: cityEvents,
      };
    }
  }

  // 6. Default general assistant response with live upcoming highlights
  const topEvents = liveEvents.slice(0, 3).map(
    (e) => `• **${e.title}** (${e.category}) - ${new Date(e.date).toLocaleDateString()} at ${e.venue.city}`
  );

  return {
    reply: `Hello! I'm **EventX AI Assistant**. I can help you discover exciting events, check ticket availability, guide you through QR ticket check-ins, and explain cancellation policies.\n\n**Trending Events Right Now:**\n${
      topEvents.length > 0 ? topEvents.join('\n') : 'New events are being scheduled soon!'
    }\n\nHow can I assist you today? You can ask me about categories (e.g. *Technology*, *Music*, *Workshops*), ticket prices, or how QR check-in works!`,
    provider: 'Rule-Based Contextual AI',
    matchedEvents: liveEvents.slice(0, 3),
  };
};

/**
 * Event Demand Insights
 * Calculates ticket sales velocity, capacity fill rates, and categorizes demand.
 * Note: Clearly distinguishes historical actual data from trend analysis.
 */
const getDemandInsights = async (eventId) => {
  const event = await Event.findById(eventId).lean();
  if (!event) {
    throw new Error('Event not found');
  }

  const bookings = await Booking.find({
    event: eventId,
    status: { $ne: 'cancelled' },
  }).sort({ createdAt: 1 }).lean();

  const totalCapacity = event.totalCapacity || 1;
  const totalSold = event.totalSold || 0;
  const fillRatePercent = Math.min(100, Math.round((totalSold / totalCapacity) * 100));

  // Calculate daily sales history
  const salesByDateMap = {};
  bookings.forEach((b) => {
    const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
    salesByDateMap[dateKey] = (salesByDateMap[dateKey] || 0) + b.totalQuantity;
  });

  const historicalSales = Object.keys(salesByDateMap).map((date) => ({
    date,
    ticketsSold: salesByDateMap[date],
  }));

  // Demand classification based strictly on actual metrics
  let demandLevel = 'Moderate';
  let trendBadge = 'Steady Interest';
  let insightsSummary = '';

  if (fillRatePercent >= 75) {
    demandLevel = 'High';
    trendBadge = 'Selling Out Fast';
    insightsSummary = `Over ${fillRatePercent}% of total capacity has been booked. High urgency for remaining tickets.`;
  } else if (fillRatePercent >= 35) {
    demandLevel = 'Moderate';
    trendBadge = 'Consistent Bookings';
    insightsSummary = `${fillRatePercent}% capacity filled with steady booking activity across tiers.`;
  } else {
    demandLevel = 'Emerging';
    trendBadge = 'Early Stage';
    insightsSummary = `Event recently listed or has plenty of seats available (${totalCapacity - totalSold} remaining).`;
  }

  return {
    eventId: event._id,
    eventTitle: event.title,
    metrics: {
      totalCapacity,
      totalSold,
      availableTickets: Math.max(0, totalCapacity - totalSold),
      fillRatePercent,
      demandLevel,
      trendBadge,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    },
    historicalSales,
    insightsSummary,
    note: 'Metrics are derived directly from actual verified ticket bookings.',
  };
};

module.exports = {
  handleChat,
  getDemandInsights,
};
