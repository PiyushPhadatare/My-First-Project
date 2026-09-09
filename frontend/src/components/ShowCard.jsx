import { Link } from 'react-router-dom';

const ShowCard = ({ show }) => {
  const showDate = new Date(show.show_date).toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className="show-card">
      <div className="show-card-header">
        <h4>{show.theater_name}</h4>
        <span className="screen-badge">{show.screen_type} · Screen {show.screen_number}</span>
      </div>
      <div className="show-card-body">
        <div className="show-info">
          <span className="show-time">🕐 {show.show_time?.slice(0, 5)}</span>
          <span className="show-date">📅 {showDate}</span>
          <span className="show-city">📍 {show.city_location}</span>
        </div>
        <div className="show-price">
          <span className="price">₹{show.ticket_price}</span>
          <span className="per-seat">per seat</span>
        </div>
      </div>
      <Link to={`/seat-selection/${show.show_id}`} className="btn-primary btn-full">
        Select Seats
      </Link>
    </div>
  );
};

export default ShowCard;

