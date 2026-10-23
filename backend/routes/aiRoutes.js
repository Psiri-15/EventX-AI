const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  chat,
  getPersonalizedRecommendations,
  getEventDemandInsights,
} = require('../controllers/aiController');

// Optional auth helper to attach user if token provided without rejecting guests
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eventx_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Guest fallback
    }
  }
  next();
};

router.post('/chat', optionalAuth, chat);
router.get('/recommendations', optionalAuth, getPersonalizedRecommendations);
router.get('/demand-insights/:eventId', getEventDemandInsights);

module.exports = router;
