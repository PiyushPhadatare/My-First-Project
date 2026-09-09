const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBookingById, cancelBooking,
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All booking routes require login

router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
