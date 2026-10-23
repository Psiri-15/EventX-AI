const express = require('express');
const router = express.Router();
const {
  getOrganizerStats,
  getOrganizerEvents,
  getEventAttendees,
} = require('../controllers/organizerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('organizer', 'admin'));

router.get('/stats', getOrganizerStats);
router.get('/events', getOrganizerEvents);
router.get('/events/:id/attendees', getEventAttendees);

module.exports = router;
