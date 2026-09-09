const db = require('../db/connection');

// GET /api/theatres
const getAllTheatres = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM theaters ORDER BY name');
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// GET /api/theatres/:id
const getTheatreById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM theaters WHERE theater_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// POST /api/theatres  (admin)
const createTheatre = async (req, res, next) => {
  try {
    const { name, city_location, total_screens } = req.body;
    if (!name || !city_location) return res.status(400).json({ success: false, message: 'name and city_location are required.' });
    const result = await db.query(
      'INSERT INTO theaters (name, city_location, total_screens) VALUES ($1, $2, $3) RETURNING *',
      [name, city_location, total_screens || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/theatres/:id  (admin)
const updateTheatre = async (req, res, next) => {
  try {
    const { name, city_location, total_screens } = req.body;
    const result = await db.query(
      'UPDATE theaters SET name=$1, city_location=$2, total_screens=$3 WHERE theater_id=$4 RETURNING *',
      [name, city_location, total_screens, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/theatres/:id  (admin)
const deleteTheatre = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM theaters WHERE theater_id=$1 RETURNING theater_id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    return res.json({ success: true, message: 'Theatre deleted.' });
  } catch (err) { next(err); }
};

// GET /api/theatres/:id/screens
const getScreensByTheatre = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM screens WHERE theater_id = $1 ORDER BY screen_number',
      [req.params.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// POST /api/theatres/:id/screens  (admin)
const createScreen = async (req, res, next) => {
  try {
    const { screen_number, screen_type, total_capacity } = req.body;
    if (!screen_number || !total_capacity) return res.status(400).json({ success: false, message: 'screen_number and total_capacity are required.' });
    const result = await db.query(
      'INSERT INTO screens (theater_id, screen_number, screen_type, total_capacity) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, screen_number, screen_type || '2D', total_capacity]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// GET /api/screens/:id/seats
const getSeatsByScreen = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM seats WHERE screen_id = $1 ORDER BY row_label, seat_number',
      [req.params.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

// POST /api/screens/:id/seats  (admin)
const createSeat = async (req, res, next) => {
  try {
    const { seat_label, row_label, seat_number, seat_type } = req.body;
    if (!seat_label || !row_label || !seat_number) return res.status(400).json({ success: false, message: 'seat_label, row_label, seat_number are required.' });
    const result = await db.query(
      'INSERT INTO seats (screen_id, seat_label, row_label, seat_number, seat_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, seat_label, row_label, seat_number, seat_type || 'REGULAR']
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = {
  getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre,
  getScreensByTheatre, createScreen,
  getSeatsByScreen, createSeat,
};
