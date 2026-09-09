const express = require('express');
const router = express.Router();
const { getSeatsByScreen, createSeat } = require('../controllers/theatreController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/:id/seats', getSeatsByScreen);
router.post('/:id/seats', authMiddleware, adminMiddleware, createSeat);

module.exports = router;
