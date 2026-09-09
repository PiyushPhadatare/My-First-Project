import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById, getShows } from '../services/api';
import ShowCard from '../components/ShowCard';
import DateSelector from '../components/DateSelector';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [allShows, setAllShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMovieById(id), getShows({ movieId: id })])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data.data);
        const showData = showsRes.data.data;
        setAllShows(showData);

        // Extract unique dates
        const dates = [...new Set(showData.map((s) => s.show_date.slice(0, 10)))].sort();
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
          setShows(showData.filter((s) => s.show_date.slice(0, 10) === dates[0]));
        }
      })
      .catch(() => setError('Failed to load movie details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShows(allShows.filter((s) => s.show_date.slice(0, 10) === date));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!movie) return <div className="error-msg">Movie not found.</div>;

  return (
    <div className="movie-details-page">
      <div className="movie-details-hero">
        <div className="movie-details-poster">
          {movie.poster_url && !movie.poster_url.includes('example.com') ? (
            <img src={movie.poster_url} alt={movie.name} />
          ) : (
            <div className="poster-placeholder large">
              <span>🎬</span>
            </div>
          )}
        </div>
        <div className="movie-details-info">
          <h1>{movie.name}</h1>
          <div className="movie-tags">
            <span className="tag">{movie.genre}</span>
            <span className="tag">{movie.language}</span>
            <span className="tag">⏱ {movie.duration_minutes} min</span>
          </div>
          <p className="movie-description">{movie.description}</p>
          <p className="release-date">
            🗓 Released: {new Date(movie.release_date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>

      <div className="shows-section">
        <h2>Available Shows</h2>

        {availableDates.length === 0 ? (
          <div className="empty-state">
            <p>😔 No shows available for this movie.</p>
          </div>
        ) : (
          <>
            <DateSelector
              dates={availableDates}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
            <div className="shows-grid">
              {shows.length === 0 ? (
                <p className="empty-state">No shows on this date.</p>
              ) : (
                shows.map((show) => <ShowCard key={show.show_id} show={show} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

