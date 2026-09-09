import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎬 CineBook</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div className="navbar-auth">
        {user ? (
          <div className="navbar-user">
            <span className="user-name">👤 {user.user_name}</span>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="navbar-user">
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

