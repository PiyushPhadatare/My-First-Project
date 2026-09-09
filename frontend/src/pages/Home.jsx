import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMovies()
      .then((res) => {
        const data = res.data.data;
        setMovies(data);
        if (data.length > 0) setFeatured(data[0]);
      })
      .catch(() => setError('Failed to load movies.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = movies.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      {/* Hero Section */}
      {featured && (
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-badge">{featured.genre}</div>
            <h1 className="hero-title">{featured.name}</h1>
            <p className="hero-meta">
              {featured.language} &nbsp;·&nbsp; {featured.duration_minutes} min
            </p>
            <p className="hero-desc">{featured.description?.slice(0, 120)}...</p>
            <div className="hero-actions">
              <Link to={`/movies/${featured.movie_id}`} className="btn-primary btn-large">
                🎟 Book Tickets
              </Link>
              <Link to="/movies" className="btn-outline btn-large">
                Browse All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Movies Section */}
      <section className="section">
        <div className="section-header">
          <h2>Now Showing</h2>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {loading && <div className="loading">Loading movies...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <p>🎬 No movies found{search ? ` for "${search}"` : ''}.</p>
          </div>
        )}

        <div className="movies-grid">
          {filtered.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

