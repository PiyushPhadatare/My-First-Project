import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowById, getShowSeats } from '../services/api';
import { useBooking } from '../context/BookingContext';
import SeatLayout from '../components/SeatLayout';
import BookingSummary from '../components/BookingSummary';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { setSelectedShow, selectedSeats, setSelectedSeats, toggleSeat } = useBooking();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedSeats([]);
    Promise.all([getShowById(showId), getShowSeats(showId)])
      .then(([showRes, seatsRes]) => {
        const showData = showRes.data.data;
        setShow(showData);
        setSelectedShow(showData);
        setSeats(seatsRes.data.data);
      })
      .catch(() => setError('Failed to load show details.'))
      .finally(() => setLoading(false));
  }, [showId]);

  const totalAmount = parseFloat(show?.ticket_price || 0) * selectedSeats.length;

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout');
  };

  if (loading) return <div className="loading">Loading seats...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="seat-selection-page">
      <div className="seat-selection-main">
        <div className="seat-selection-header">
          <h2>{show?.movie_name}</h2>
          <p>{show?.theater_name} · {show?.screen_type} · {show?.show_time?.slice(0,5)}</p>
        </div>
        <SeatLayout seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} ticketPrice={show?.ticket_price} />
      </div>

      <div className="seat-selection-sidebar">
        <BookingSummary
          show={show}
          selectedSeats={selectedSeats}
          totalAmount={totalAmount}
        />
        <button
          className="btn-primary btn-full"
          disabled={selectedSeats.length === 0}
          onClick={handleProceed}
        >
          Proceed to Checkout ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;

