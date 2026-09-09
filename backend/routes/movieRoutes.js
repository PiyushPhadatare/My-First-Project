const express = require('express');
const router = express.Router();
const {
  getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie,
} = require('../controllers/movieController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', authMiddleware, adminMiddleware, createMovie);
router.put('/:id', authMiddleware, adminMiddleware, updateMovie);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMovie);

module.exports = router;
