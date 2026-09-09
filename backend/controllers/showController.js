const db = require('../db/connection');

// GET /api/shows?movieId=&date=
const getShows = async (req, res, next) => {
  try {
    const { movieId, date } = req.query;

    let query = `
      SELECT s.*, m.name AS movie_name, m.duration_minutes, m.genre, m.poster_url,
             sc.screen_number, sc.screen_type,
             t.name AS theater_name, t.city_location
      FROM shows s
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN screens sc ON s.screen_id = sc.screen_id
      JOIN theaters t ON sc.theater_id = t.theater_id
      WHERE 1=1
    `;
    const params = [];

    if (movieId) {
      params.push(movieId);
      query += ` AND s.movie_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND s.show_date = $${params.length}`;
    }

    query += ' ORDER BY s.show_date, s.show_time';

    const result = await db.query(query, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/shows/:id
const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT s.*, m.name AS movie_name, m.duration_minutes, m.genre, m.poster_url, m.description,
              sc.screen_number, sc.screen_type, sc.total_capacity,
              t.name AS theater_name, t.city_location
       FROM shows s
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN theaters t ON sc.theater_id = t.theater_id
       WHERE s.show_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/shows/:id/seats
const getShowSeats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const showResult = await db.query('SELECT screen_id FROM shows WHERE show_id = $1', [id]);
    if (showResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }
    const { screen_id } = showResult.rows[0];

    const result = await db.query(
      `SELECT st.*,
        CASE
          WHEN bs.seat_status = 'ACTIVE' THEN 'booked'
          ELSE 'available'
        END AS status
       FROM seats st
       LEFT JOIN booking_seats bs
         ON bs.seat_id = st.seat_id
         AND bs.show_id = $1
         AND bs.seat_status = 'ACTIVE'
       WHERE st.screen_id = $2
       ORDER BY st.row_label, st.seat_number`,
      [id, screen_id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/shows  (admin)
const createShow = async (req, res, next) => {
  try {
    const { movie_id, screen_id, show_date, show_time, show_duration, ticket_price } = req.body;

    if (!movie_id || !screen_id || !show_date || !show_time || !show_duration || !ticket_price) {
      return res.status(400).json({ success: false, message: 'All show fields are required.' });
    }

    const result = await db.query(
      `INSERT INTO shows (movie_id, screen_id, show_date, show_time, show_duration, ticket_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [movie_id, screen_id, show_date, show_time, show_duration, ticket_price]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/shows/:id  (admin)
const updateShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { movie_id, screen_id, show_date, show_time, show_duration, ticket_price } = req.body;

    const result = await db.query(
      `UPDATE shows SET movie_id=$1, screen_id=$2, show_date=$3, show_time=$4,
       show_duration=$5, ticket_price=$6 WHERE show_id=$7 RETURNING *`,
      [movie_id, screen_id, show_date, show_time, show_duration, ticket_price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/shows/:id  (admin)
const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM shows WHERE show_id=$1 RETURNING show_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }
    return res.json({ success: true, message: 'Show deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShows, getShowById, getShowSeats, createShow, updateShow, deleteShow };
