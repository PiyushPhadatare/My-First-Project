import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminDashboard, getAdminBookings,
  getMovies, createMovie, deleteMovie,
  getTheatres, createTheatre, deleteTheatre,
  getShows, createShow, deleteShow,
} from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Movie form state
  const [movieForm, setMovieForm] = useState({ name: '', language: '', release_date: '', duration_minutes: '', genre: '', description: '', poster_url: '' });
  const [theatreForm, setTheatreForm] = useState({ name: '', city_location: '', total_screens: '' });
  const [showForm, setShowForm] = useState({ movie_id: '', screen_id: '', show_date: '', show_time: '', show_duration: '', ticket_price: '' });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => {
    if (tab === 'bookings') loadBookings();
    if (tab === 'movies') loadMovies();
    if (tab === 'theatres') loadTheatres();
    if (tab === 'shows') { loadMovies(); loadShows(); }
  }, [tab]);

  const loadDashboard = () => {
    setLoading(true);
    getAdminDashboard()
      .then((r) => setStats(r.data.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  };
  const loadBookings = () => getAdminBookings().then((r) => setBookings(r.data.data)).catch(console.error);
  const loadMovies = () => getMovies().then((r) => setMovies(r.data.data)).catch(console.error);
  const loadTheatres = () => getTheatres().then((r) => setTheatres(r.data.data)).catch(console.error);
  const loadShows = () => getShows().then((r) => setShows(r.data.data)).catch(console.error);

  const handleMovieSubmit = async (e) => {
    e.preventDefault(); setFormMsg('');
    try {
      await createMovie({ ...movieForm, duration_minutes: parseInt(movieForm.duration_minutes) });
      setFormMsg('✅ Movie added!');
      setMovieForm({ name: '', language: '', release_date: '', duration_minutes: '', genre: '', description: '', poster_url: '' });
      loadMovies();
    } catch (err) { setFormMsg('❌ ' + (err.response?.data?.message || 'Failed.')); }
  };
  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try { await deleteMovie(id); loadMovies(); } catch { alert('Failed to delete.'); }
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault(); setFormMsg('');
    try {
      await createTheatre({ ...theatreForm, total_screens: parseInt(theatreForm.total_screens) || 0 });
      setFormMsg('✅ Theatre added!');
      setTheatreForm({ name: '', city_location: '', total_screens: '' });
      loadTheatres();
    } catch (err) { setFormMsg('❌ ' + (err.response?.data?.message || 'Failed.')); }
  };
  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try { await deleteTheatre(id); loadTheatres(); } catch { alert('Failed to delete.'); }
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault(); setFormMsg('');
    try {
      await createShow({
        ...showForm,
        movie_id: parseInt(showForm.movie_id),
        screen_id: parseInt(showForm.screen_id),
        show_duration: parseInt(showForm.show_duration),
        ticket_price: parseFloat(showForm.ticket_price),
      });
      setFormMsg('✅ Show added!');
      setShowForm({ movie_id: '', screen_id: '', show_date: '', show_time: '', show_duration: '', ticket_price: '' });
      loadShows();
    } catch (err) { setFormMsg('❌ ' + (err.response?.data?.message || 'Failed.')); }
  };
  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try { await deleteShow(id); loadShows(); } catch { alert('Failed to delete.'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>⚙️ Admin</h2>
        {['dashboard', 'movies', 'theatres', 'shows', 'bookings'].map((t) => (
          <button
            key={t} onClick={() => { setTab(t); setFormMsg(''); }}
            className={`admin-tab-btn ${tab === t ? 'active' : ''}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <>
            <h1>Dashboard</h1>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error-msg">{error}</div>}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{stats.total_movies}</div><div className="stat-label">Movies</div></div>
                <div className="stat-card"><div className="stat-value">{stats.total_theatres}</div><div className="stat-label">Theatres</div></div>
                <div className="stat-card"><div className="stat-value">{stats.total_screens}</div><div className="stat-label">Screens</div></div>
                <div className="stat-card"><div className="stat-value">{stats.todays_shows}</div><div className="stat-label">Today's Shows</div></div>
                <div className="stat-card"><div className="stat-value">{stats.todays_bookings}</div><div className="stat-label">Today's Bookings</div></div>
                <div className="stat-card revenue"><div className="stat-value">₹{stats.todays_revenue}</div><div className="stat-label">Today's Revenue</div></div>
              </div>
            )}
          </>
        )}

        {/* MOVIES */}
        {tab === 'movies' && (
          <>
            <h1>Manage Movies</h1>
            {formMsg && <div className="form-msg">{formMsg}</div>}
            <form className="admin-form" onSubmit={handleMovieSubmit}>
              <h3>Add New Movie</h3>
              <div className="form-grid">
                {[['name','Movie Name','text'],['language','Language','text'],['release_date','Release Date','date'],['duration_minutes','Duration (min)','number'],['genre','Genre','text'],['poster_url','Poster URL','url']].map(([k,p,t]) => (
                  <div key={k} className="form-group">
                    <label>{p}</label>
                    <input type={t} placeholder={p} value={movieForm[k]} onChange={(e) => setMovieForm({...movieForm,[k]:e.target.value})} required={k !== 'poster_url'} />
                  </div>
                ))}
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea placeholder="Movie description" value={movieForm.description} onChange={(e) => setMovieForm({...movieForm,description:e.target.value})} rows={3} />
                </div>
              </div>
              <button className="btn-primary" type="submit">Add Movie</button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Genre</th><th>Language</th><th>Duration</th><th>Action</th></tr></thead>
                <tbody>
                  {movies.map((m) => (
                    <tr key={m.movie_id}>
                      <td>{m.movie_id}</td><td>{m.name}</td><td>{m.genre}</td><td>{m.language}</td><td>{m.duration_minutes}min</td>
                      <td><button className="btn-danger btn-small" onClick={() => handleDeleteMovie(m.movie_id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* THEATRES */}
        {tab === 'theatres' && (
          <>
            <h1>Manage Theatres</h1>
            {formMsg && <div className="form-msg">{formMsg}</div>}
            <form className="admin-form" onSubmit={handleTheatreSubmit}>
              <h3>Add New Theatre</h3>
              <div className="form-grid">
                <div className="form-group"><label>Theatre Name</label><input type="text" placeholder="Theatre name" value={theatreForm.name} onChange={(e) => setTheatreForm({...theatreForm,name:e.target.value})} required /></div>
                <div className="form-group"><label>City</label><input type="text" placeholder="City" value={theatreForm.city_location} onChange={(e) => setTheatreForm({...theatreForm,city_location:e.target.value})} required /></div>
                <div className="form-group"><label>Total Screens</label><input type="number" placeholder="0" value={theatreForm.total_screens} onChange={(e) => setTheatreForm({...theatreForm,total_screens:e.target.value})} /></div>
              </div>
              <button className="btn-primary" type="submit">Add Theatre</button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>City</th><th>Screens</th><th>Action</th></tr></thead>
                <tbody>
                  {theatres.map((t) => (
                    <tr key={t.theater_id}>
                      <td>{t.theater_id}</td><td>{t.name}</td><td>{t.city_location}</td><td>{t.total_screens}</td>
                      <td><button className="btn-danger btn-small" onClick={() => handleDeleteTheatre(t.theater_id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SHOWS */}
        {tab === 'shows' && (
          <>
            <h1>Manage Shows</h1>
            {formMsg && <div className="form-msg">{formMsg}</div>}
            <form className="admin-form" onSubmit={handleShowSubmit}>
              <h3>Add New Show</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Movie</label>
                  <select value={showForm.movie_id} onChange={(e) => setShowForm({...showForm,movie_id:e.target.value})} required>
                    <option value="">Select movie</option>
                    {movies.map((m) => <option key={m.movie_id} value={m.movie_id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Screen ID</label><input type="number" placeholder="Screen ID" value={showForm.screen_id} onChange={(e) => setShowForm({...showForm,screen_id:e.target.value})} required /></div>
                <div className="form-group"><label>Date</label><input type="date" value={showForm.show_date} onChange={(e) => setShowForm({...showForm,show_date:e.target.value})} required /></div>
                <div className="form-group"><label>Time</label><input type="time" value={showForm.show_time} onChange={(e) => setShowForm({...showForm,show_time:e.target.value})} required /></div>
                <div className="form-group"><label>Duration (min)</label><input type="number" placeholder="120" value={showForm.show_duration} onChange={(e) => setShowForm({...showForm,show_duration:e.target.value})} required /></div>
                <div className="form-group"><label>Ticket Price (₹)</label><input type="number" step="0.01" placeholder="200" value={showForm.ticket_price} onChange={(e) => setShowForm({...showForm,ticket_price:e.target.value})} required /></div>
              </div>
              <button className="btn-primary" type="submit">Add Show</button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Movie</th><th>Screen</th><th>Date</th><th>Time</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {shows.map((s) => (
                    <tr key={s.show_id}>
                      <td>{s.show_id}</td><td>{s.movie_name}</td><td>#{s.screen_id}</td>
                      <td>{new Date(s.show_date).toLocaleDateString('en-IN')}</td>
                      <td>{s.show_time?.slice(0,5)}</td><td>₹{s.ticket_price}</td>
                      <td><button className="btn-danger btn-small" onClick={() => handleDeleteShow(s.show_id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <>
            <h1>All Bookings</h1>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>User</th><th>Movie</th><th>Theatre</th><th>Date</th><th>Tickets</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td>#{b.booking_id}</td>
                      <td>{b.user_name}<br/><small>{b.email}</small></td>
                      <td>{b.movie_name}</td>
                      <td>{b.theater_name}</td>
                      <td>{new Date(b.show_date).toLocaleDateString('en-IN')}</td>
                      <td>{b.total_tickets}</td>
                      <td>₹{b.total_amount}</td>
                      <td><span className={`status-badge status-${b.booking_status?.toLowerCase()}`}>{b.booking_status}</span></td>
                      <td><span className={`status-badge status-${b.payment_status?.toLowerCase()}`}>{b.payment_status || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

