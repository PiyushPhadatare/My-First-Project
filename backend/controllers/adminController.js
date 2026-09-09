const db = require('../db/connection');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM movies)                                              AS total_movies,
        (SELECT COUNT(*) FROM theaters)                                           AS total_theatres,
        (SELECT COUNT(*) FROM screens)                                            AS total_screens,
        (SELECT COUNT(*) FROM shows WHERE show_date = CURRENT_DATE)               AS todays_shows,
        (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURRENT_DATE)   AS todays_bookings,
        (SELECT COALESCE(SUM(total_amount), 0)
           FROM bookings
          WHERE DATE(booking_date) = CURRENT_DATE
            AND booking_status = 'CONFIRMED')                                     AS todays_revenue
    `);
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT b.*, u.user_name, u.email,
             m.name AS movie_name,
             t.name AS theater_name,
             s.show_date, s.show_time,
             p.payment_status, p.payment_method
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN shows s ON b.show_id = s.show_id
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN screens sc ON s.screen_id = sc.screen_id
      JOIN theaters t ON sc.theater_id = t.theater_id
      LEFT JOIN payments p ON p.booking_id = b.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND b.booking_status = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND s.show_date = $${params.length}`;
    }

    query += ' ORDER BY b.booking_date DESC';

    const result = await db.query(query, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getAllBookings };
