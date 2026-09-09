const BookingSummary = ({ show, selectedSeats, totalAmount }) => {
  if (!show) return null;

  return (
    <div className="booking-summary">
      <h3>Booking Summary</h3>
      <div className="summary-row">
        <span>Movie</span>
        <span>{show.movie_name}</span>
      </div>
      <div className="summary-row">
        <span>Theatre</span>
        <span>{show.theater_name}</span>
      </div>
      <div className="summary-row">
        <span>Screen</span>
        <span>{show.screen_type} · Screen {show.screen_number}</span>
      </div>
      <div className="summary-row">
        <span>Date & Time</span>
        <span>
          {new Date(show.show_date).toLocaleDateString('en-IN')} · {show.show_time?.slice(0, 5)}
        </span>
      </div>
      <div className="summary-row">
        <span>Seats</span>
        <span className="seats-list">
          {selectedSeats.length > 0
            ? selectedSeats.map((s) => s.seat_label).join(', ')
            : '—'}
        </span>
      </div>
      <div className="summary-row">
        <span>Tickets</span>
        <span>{selectedSeats.length}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-row summary-total">
        <span>Total</span>
        <span className="total-amount">₹{totalAmount || 0}</span>
      </div>
    </div>
  );
};

export default BookingSummary;

