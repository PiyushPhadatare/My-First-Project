import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getBookingById } from '../services/api';

const BookingSuccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFailed = searchParams.get('status') === 'failed';

  useEffect(() => {
    getBookingById(id)
      .then((res) => setBooking(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading ticket...</div>;

  return (
    <div className="booking-success-page">
      <div className="ticket-card">
        <div className={`ticket-status ${isFailed ? 'failed' : 'success'}`}>
          {isFailed ? '❌ Payment Failed' : '✅ Booking Confirmed!'}
        </div>

        {booking && (
          <>
            <div className="ticket-header">
              <h2>{booking.movie_name}</h2>
              <span className="booking-id">Booking #{booking.booking_id}</span>
            </div>

            <div className="ticket-body">
              <div className="ticket-row">
                <span>Theatre</span><span>{booking.theater_name}</span>
              </div>
              <div className="ticket-row">
                <span>Screen</span><span>{booking.screen_type} · Screen {booking.screen_number}</span>
              </div>
              <div className="ticket-row">
                <span>Date</span>
                <span>{new Date(booking.show_date).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="ticket-row">
                <span>Time</span><span>{booking.show_time?.slice(0, 5)}</span>
              </div>
              <div className="ticket-row">
                <span>Seats</span>
                <span>{booking.seats?.join(', ')}</span>
              </div>
              <div className="ticket-row">
                <span>Tickets</span><span>{booking.total_tickets}</span>
              </div>
              <div className="ticket-divider" />
              <div className="ticket-row ticket-total">
                <span>Total Paid</span>
                <span>₹{booking.total_amount}</span>
              </div>
              <div className="ticket-row">
                <span>Status</span>
                <span className={`status-badge status-${booking.booking_status?.toLowerCase()}`}>
                  {booking.booking_status}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="ticket-actions">
          <Link to="/my-bookings" className="btn-primary">My Bookings</Link>
          <Link to="/" className="btn-outline">Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

