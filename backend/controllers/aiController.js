const { handleChat, getDemandInsights } = require('../services/aiService');
const { getRecommendations } = require('../services/recommendationService');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Public (optional auth attaches user context)
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    const response = await handleChat({
      message,
      history,
      user: req.user || null,
    });

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Public (Uses logged-in user interests or query interests)
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    let userId = null;
    let interests = [];

    if (req.user) {
      userId = req.user._id;
      interests = req.user.interests || [];
    } else if (req.query.interests) {
      interests = req.query.interests.split(',').map((i) => i.trim());
    }

    const limit = Number(req.query.limit) || 6;
    const recommendedEvents = await getRecommendations(userId, interests, limit);

    res.status(200).json({
      success: true,
      count: recommendedEvents.length,
      recommendations: recommendedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Event Demand Insights
// @route   GET /api/ai/demand-insights/:eventId
// @access  Public
const getEventDemandInsights = async (req, res, next) => {
  try {
    const insights = await getDemandInsights(req.params.eventId);

    res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getPersonalizedRecommendations,
  getEventDemandInsights,
};
