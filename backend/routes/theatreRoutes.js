const express = require('express');
const router = express.Router();
const {
  getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre,
  getScreensByTheatre, createScreen,
} = require('../controllers/theatreController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getAllTheatres);
router.get('/:id', getTheatreById);
router.post('/', authMiddleware, adminMiddleware, createTheatre);
router.put('/:id', authMiddleware, adminMiddleware, updateTheatre);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTheatre);

// Screens nested under theatres
router.get('/:id/screens', getScreensByTheatre);
router.post('/:id/screens', authMiddleware, adminMiddleware, createScreen);

module.exports = router;
