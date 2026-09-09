import { useState, useEffect } from 'react';
import { getMovies } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMovies()
      .then((res) => setMovies(res.data.data))
      .catch(() => setError('Failed to load movies.'))
      .finally(() => setLoading(false));
  }, []);

  const genres = [...new Set(movies.map((m) => m.genre))];

  const filtered = movies.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter ? m.genre === genreFilter : true;
    return matchSearch && matchGenre;
  });

  return (
    <div className="movies-page">
      <div className="page-header">
        <h1>🎬 All Movies</h1>
        <p>{filtered.length} movie{filtered.length !== 1 ? 's' : ''} available</p>
      </div>

      <div className="movies-filters">
        <SearchBar value={search} onChange={setSearch} />
        <div className="genre-filters">
          <button
            className={`genre-btn ${genreFilter === '' ? 'active' : ''}`}
            onClick={() => setGenreFilter('')}
          >All</button>
          {genres.map((g) => (
            <button
              key={g}
              className={`genre-btn ${genreFilter === g ? 'active' : ''}`}
              onClick={() => setGenreFilter(g)}
            >{g}</button>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Loading movies...</div>}
      {error && <div className="error-msg">{error}</div>}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>🎬 No movies match your search.</p>
        </div>
      )}

      <div className="movies-grid">
        {filtered.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Movies;

