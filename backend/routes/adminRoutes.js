const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllEvents,
  updateEventStatus,
  getAllUsers,
  updateUser,
  getAllBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/events', getAllEvents);
router.put('/events/:id/status', updateEventStatus);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/bookings', getAllBookings);

module.exports = router;
