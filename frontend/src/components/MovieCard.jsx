import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <div className="movie-card-poster">
        {movie.poster_url && !movie.poster_url.includes('example.com') ? (
          <img src={movie.poster_url} alt={movie.name} />
        ) : (
          <div className="poster-placeholder">
            <span>🎬</span>
            <p>{movie.name}</p>
          </div>
        )}
        <div className="movie-card-overlay">
          <span className="genre-badge">{movie.genre}</span>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-title">{movie.name}</h3>
        <div className="movie-meta">
          <span>🌐 {movie.language}</span>
          <span>⏱ {movie.duration_minutes} min</span>
        </div>
        <Link to={`/movies/${movie.movie_id}`} className="btn-primary btn-small">
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;

