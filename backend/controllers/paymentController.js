const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/connection');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required.' });
    }

    const bookingResult = await db.query(
      'SELECT booking_id, user_id, total_amount, booking_status FROM bookings WHERE booking_id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingResult.rows[0];

    if (booking.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (booking.booking_status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ success: false, message: `Cannot create order for booking in status: ${booking.booking_status}` });
    }

    // Amount in paise (Razorpay requires smallest currency unit)
    const amountInPaise = Math.round(parseFloat(booking.total_amount) * 100);

    let order;
    if (process.env.RAZORPAY_KEY_ID.includes('REPLACE')) {
      // MOCK MODE for college project demo
      order = {
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
      };
    } else {
      // REAL MODE
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `booking_${booking_id}`,
        notes: { booking_id: String(booking_id) },
      });
    }

    // Store the order in payments table with CREATED status
    await db.query(
      `INSERT INTO payments (booking_id, amount, payment_status, gateway_order_id)
       VALUES ($1, $2, 'CREATED', $3)
       ON CONFLICT (booking_id) DO UPDATE SET gateway_order_id = $3, payment_status = 'CREATED'`,
      [booking_id, booking.total_amount, order.id]
    );

    return res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    // Verify Razorpay signature (HMAC SHA256) unless in Mock Mode
    const isMockMode = process.env.RAZORPAY_KEY_ID.includes('REPLACE') && razorpay_order_id.startsWith('order_mock_');
    
    if (!isMockMode) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        // Signature mismatch — mark payment as FAILED
        await db.query(
          `UPDATE payments SET payment_status = 'FAILED', gateway_payment_id = $1 WHERE gateway_order_id = $2`,
          [razorpay_payment_id, razorpay_order_id]
        );
        await db.query(
          `UPDATE bookings SET booking_status = 'PAYMENT_FAILED' WHERE booking_id = $1`,
          [booking_id]
        );
        return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
      }
    }

    await client.query('BEGIN');

    // Fetch payment method from Razorpay API (skip if mock)
    let payment_method = isMockMode ? 'CARD' : 'UNKNOWN';
    if (!isMockMode) {
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        payment_method = paymentDetails.method ? paymentDetails.method.toUpperCase() : 'UNKNOWN';
      } catch (_) {
        // Non-critical — continue even if method fetch fails
      }
    }

    // Update payment to SUCCESS
    await client.query(
      `UPDATE payments
       SET payment_status = 'SUCCESS',
           gateway_payment_id = $1,
           payment_method = $2,
           payment_time = NOW()
       WHERE gateway_order_id = $3`,
      [razorpay_payment_id, payment_method, razorpay_order_id]
    );

    // Confirm booking
    const bookingResult = await client.query(
      `UPDATE bookings SET booking_status = 'CONFIRMED' WHERE booking_id = $1 RETURNING *`,
      [booking_id]
    );

    await client.query('COMMIT');

    return res.json({ success: true, data: bookingResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { createOrder, verifyPayment };
