import { Link, NavLink } from 'react-router-dom';
import './navbar.css';

// PUBLIC_INTERFACE
export default function Navbar({ user, onSignIn, onSignOut, theme, onToggleTheme, bypass }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">Design Studio</Link>
        <NavLink to="/models" className="nav-item">Models</NavLink>
        <NavLink to="/roles" className="nav-item">Roles</NavLink>
        <NavLink to="/mappings" className="nav-item">Mappings</NavLink>
        <NavLink to="/collaboration" className="nav-item">Collab</NavLink>
        <NavLink to="/device" className="nav-item">Device</NavLink>
      </div>
      <div className="nav-right">
        <button className="btn small" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {bypass && (
          <span className="badge bypass" title="Authentication bypass enabled (Development Mode)">
            AUTH BYPASS
          </span>
        )}
        {user ? (
          <>
            <span className="user">{user.name}</span>
            <button className="btn" onClick={onSignOut}>Sign out</button>
          </>
        ) : (
          <button className="btn" onClick={onSignIn}>Sign in</button>
        )}
      </div>
    </nav>
  );
}
