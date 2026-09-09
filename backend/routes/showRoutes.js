const express = require('express');
const router = express.Router();
const {
  getShows, getShowById, getShowSeats, createShow, updateShow, deleteShow,
} = require('../controllers/showController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getShows);                                          // ?movieId=&date=
router.get('/:id', getShowById);
router.get('/:id/seats', getShowSeats);
router.post('/', authMiddleware, adminMiddleware, createShow);
router.put('/:id', authMiddleware, adminMiddleware, updateShow);
router.delete('/:id', authMiddleware, adminMiddleware, deleteShow);

module.exports = router;
