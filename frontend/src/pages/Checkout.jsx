import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { createBooking, createPaymentOrder, verifyPayment } from '../services/api';
import BookingSummary from '../components/BookingSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { selectedShow, selectedSeats, setBooking, clearBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = parseFloat(selectedShow?.ticket_price || 0) * selectedSeats.length;

  if (!selectedShow || selectedSeats.length === 0) {
    return (
      <div className="empty-state center">
        <h2>No seats selected</h2>
        <p>Please go back and select seats first.</p>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Create booking (server validates seats & calculates price)
      const bookingRes = await createBooking({
        show_id: selectedShow.show_id,
        seat_ids: selectedSeats.map((s) => s.seat_id),
      });
      const { booking } = bookingRes.data.data;
      setBooking(booking);

      // Step 2: Create Razorpay order
      const orderRes = await createPaymentOrder({ booking_id: booking.booking_id });
      const { order_id, amount, currency, razorpay_key_id } = orderRes.data.data;

      // Step 3: Check if in Mock Mode (college project demo)
      if (razorpay_key_id.includes('REPLACE')) {
        // Simulate a short payment delay, then verify
        setTimeout(async () => {
          try {
            await verifyPayment({
              razorpay_order_id: order_id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: 'mock_signature',
              booking_id: booking.booking_id,
            });
            clearBooking();
            navigate(`/booking-success/${booking.booking_id}`);
          } catch (err) {
            navigate(`/booking-success/${booking.booking_id}?status=failed`);
          }
        }, 1500);
        return; // Exit here for mock mode
      }

      // Step 4: Open REAL Razorpay checkout
      const options = {
        key: razorpay_key_id,
        amount,
        currency,
        name: 'CineBook',
        description: `Booking #${booking.booking_id} - ${selectedShow.movie_name}`,
        order_id,
        handler: async (response) => {
          try {
            // Step 5: Verify on backend
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.booking_id,
            });
            clearBooking();
            navigate(`/booking-success/${booking.booking_id}`);
          } catch {
            navigate(`/booking-success/${booking.booking_id}?status=failed`);
          }
        },
        prefill: { name: 'CineBook User' },
        theme: { color: '#a855f7' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load.');
      }
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Booking failed. Seats may already be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-main">
        <h1>Confirm Your Booking</h1>
        {error && <div className="error-msg">{error}</div>}
        <BookingSummary
          show={selectedShow}
          selectedSeats={selectedSeats}
          totalAmount={totalAmount}
        />
        <div className="checkout-note">
          <p>💡 Your seats will be confirmed only after payment is verified by our server.</p>
          <p>🔒 Use Razorpay <strong>Test Mode</strong>: Card 4111 1111 1111 1111 · Any future date · Any CVV</p>
        </div>
        <button
          className="btn-primary btn-large btn-full"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;

