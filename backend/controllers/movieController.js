const db = require('../db/connection');

// GET /api/movies
const getAllMovies = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM movies ORDER BY release_date DESC'
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM movies WHERE movie_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/movies  (admin)
const createMovie = async (req, res, next) => {
  try {
    const { name, language, release_date, duration_minutes, genre, description, poster_url } = req.body;

    if (!name || !language || !release_date || !duration_minutes || !genre) {
      return res.status(400).json({ success: false, message: 'name, language, release_date, duration_minutes and genre are required.' });
    }

    const result = await db.query(
      `INSERT INTO movies (name, language, release_date, duration_minutes, genre, description, poster_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, language, release_date, duration_minutes, genre, description || null, poster_url || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/movies/:id  (admin)
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, language, release_date, duration_minutes, genre, description, poster_url } = req.body;

    const result = await db.query(
      `UPDATE movies
       SET name=$1, language=$2, release_date=$3, duration_minutes=$4,
           genre=$5, description=$6, poster_url=$7
       WHERE movie_id=$8
       RETURNING *`,
      [name, language, release_date, duration_minutes, genre, description, poster_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/movies/:id  (admin)
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM movies WHERE movie_id=$1 RETURNING movie_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    return res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
