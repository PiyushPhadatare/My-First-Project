const db = require('../db/connection');

// POST /api/bookings  — full transactional seat locking
const createBooking = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { show_id, seat_ids } = req.body;
    const user_id = req.user.user_id;

    if (!show_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'show_id and a non-empty seat_ids array are required.' });
    }

    await client.query('BEGIN');

    // 1. Lock and fetch the show (prevent phantom reads)
    const showResult = await client.query(
      'SELECT show_id, screen_id, ticket_price FROM shows WHERE show_id = $1 FOR UPDATE',
      [show_id]
    );
    if (showResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }
    const show = showResult.rows[0];

    // 2. Verify all seats belong to this show's screen
    const seatPlaceholders = seat_ids.map((_, i) => `$${i + 2}`).join(', ');
    const seatCheck = await client.query(
      `SELECT seat_id, screen_id FROM seats WHERE seat_id IN (${seatPlaceholders}) AND screen_id = $1`,
      [show.screen_id, ...seat_ids]
    );
    if (seatCheck.rows.length !== seat_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'One or more seats do not belong to this show\'s screen.' });
    }

    // 3. Lock & check for already-booked seats
    const lockResult = await client.query(
      `SELECT seat_id FROM booking_seats
       WHERE show_id = $1 AND seat_id = ANY($2::int[]) AND seat_status = 'ACTIVE'
       FOR UPDATE`,
      [show_id, seat_ids]
    );
    if (lockResult.rows.length > 0) {
      await client.query('ROLLBACK');
      const takenIds = lockResult.rows.map(r => r.seat_id);
      return res.status(409).json({ success: false, message: `Seats already booked: ${takenIds.join(', ')}` });
    }

    // 4. Calculate price server-side (never trust frontend price)
    const total_tickets = seat_ids.length;
    const total_amount = parseFloat(show.ticket_price) * total_tickets;

    // 5. Create the booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, show_id, total_tickets, total_amount, booking_status)
       VALUES ($1, $2, $3, $4, 'PENDING_PAYMENT')
       RETURNING *`,
      [user_id, show_id, total_tickets, total_amount]
    );
    const booking = bookingResult.rows[0];

    // 6. Insert booking_seats
    for (const seat_id of seat_ids) {
      await client.query(
        `INSERT INTO booking_seats (booking_id, show_id, seat_id, seat_status)
         VALUES ($1, $2, $3, 'ACTIVE')`,
        [booking.booking_id, show_id, seat_id]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ success: true, data: { booking, total_amount } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT b.*,
              m.name AS movie_name, m.poster_url,
              t.name AS theater_name, t.city_location,
              s.show_date, s.show_time, s.ticket_price,
              sc.screen_number, sc.screen_type,
              p.payment_status, p.payment_method, p.gateway_payment_id,
              ARRAY_AGG(st.seat_label ORDER BY st.seat_label) AS seats
       FROM bookings b
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN theaters t ON sc.theater_id = t.theater_id
       LEFT JOIN booking_seats bs ON bs.booking_id = b.booking_id AND bs.seat_status = 'ACTIVE'
       LEFT JOIN seats st ON st.seat_id = bs.seat_id
       LEFT JOIN payments p ON p.booking_id = b.booking_id
       WHERE b.user_id = $1
       GROUP BY b.booking_id, m.name, m.poster_url, t.name, t.city_location,
                s.show_date, s.show_time, s.ticket_price,
                sc.screen_number, sc.screen_type,
                p.payment_status, p.payment_method, p.gateway_payment_id
       ORDER BY b.booking_date DESC`,
      [req.user.user_id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT b.*,
              m.name AS movie_name, m.poster_url, m.language, m.genre,
              t.name AS theater_name, t.city_location,
              s.show_date, s.show_time, s.ticket_price,
              sc.screen_number, sc.screen_type,
              p.payment_status, p.payment_method, p.gateway_payment_id, p.payment_time,
              ARRAY_AGG(st.seat_label ORDER BY st.seat_label) AS seats
       FROM bookings b
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN theaters t ON sc.theater_id = t.theater_id
       LEFT JOIN booking_seats bs ON bs.booking_id = b.booking_id
       LEFT JOIN seats st ON st.seat_id = bs.seat_id
       LEFT JOIN payments p ON p.booking_id = b.booking_id
       WHERE b.booking_id = $1
       GROUP BY b.booking_id, m.name, m.poster_url, m.language, m.genre,
                t.name, t.city_location, s.show_date, s.show_time, s.ticket_price,
                sc.screen_number, sc.screen_type,
                p.payment_status, p.payment_method, p.gateway_payment_id, p.payment_time`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = result.rows[0];

    // Only allow the booking owner or an admin to view it
    if (booking.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE booking_id = $1 FOR UPDATE',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingResult.rows[0];

    if (booking.user_id !== req.user.user_id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (booking.booking_status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const result = await client.query(
      `UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
