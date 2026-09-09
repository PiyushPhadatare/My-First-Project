const TheatreCard = ({ theatre }) => {
  return (
    <div className="theatre-card">
      <div className="theatre-icon">🏛</div>
      <div className="theatre-info">
        <h4>{theatre.name}</h4>
        <span className="theatre-city">📍 {theatre.city_location}</span>
        <span className="theatre-screens">🖥 {theatre.total_screens} Screens</span>
      </div>
    </div>
  );
};

export default TheatreCard;

