const express = require('express');
const router = express.Router();
const {
  getMyTickets,
  getTicketByCode,
  validateTicket,
  checkInTicket,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my-tickets', getMyTickets);
router.get('/code/:code', getTicketByCode);

// Organizer & Admin ticket entry validation routes
router.post('/validate', authorize('organizer', 'admin'), validateTicket);
router.post('/check-in', authorize('organizer', 'admin'), checkInTicket);

module.exports = router;
