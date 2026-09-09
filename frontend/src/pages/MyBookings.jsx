import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = () => {
    getMyBookings()
      .then((res) => setBookings(res.data.data))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="my-bookings-page">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>🎟 You have no bookings yet.</p>
          <Link to="/movies" className="btn-primary">Browse Movies</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => (
            <div key={b.booking_id} className="booking-card">
              <div className="booking-card-header">
                <h3>{b.movie_name}</h3>
                <span className={`status-badge status-${b.booking_status?.toLowerCase()}`}>
                  {b.booking_status}
                </span>
              </div>
              <div className="booking-card-body">
                <div className="booking-row"><span>Theatre</span><span>{b.theater_name}</span></div>
                <div className="booking-row">
                  <span>Date & Time</span>
                  <span>{new Date(b.show_date).toLocaleDateString('en-IN')} · {b.show_time?.slice(0,5)}</span>
                </div>
                <div className="booking-row">
                  <span>Seats</span>
                  <span>{b.seats?.join(', ')}</span>
                </div>
                <div className="booking-row">
                  <span>Amount</span><span>₹{b.total_amount}</span>
                </div>
                <div className="booking-row">
                  <span>Payment</span>
                  <span className={`status-badge status-${b.payment_status?.toLowerCase()}`}>
                    {b.payment_status || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="booking-card-actions">
                <Link to={`/booking-success/${b.booking_id}`} className="btn-outline btn-small">
                  View Ticket
                </Link>
                {b.booking_status === 'CONFIRMED' && (
                  <button
                    className="btn-danger btn-small"
                    onClick={() => handleCancel(b.booking_id)}
                    disabled={cancelling === b.booking_id}
                  >
                    {cancelling === b.booking_id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

