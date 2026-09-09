const express = require('express');
const router = express.Router();
const { getDashboard, getAllBookings } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware); // All admin routes require admin role

router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);

module.exports = router;
