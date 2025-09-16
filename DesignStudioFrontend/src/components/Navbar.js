import { Link, NavLink, useLocation } from 'react-router-dom';
import './navbar.css';

// PUBLIC_INTERFACE
export default function Navbar({ user, onSignIn, onSignOut, theme, onToggleTheme, bypass }) {
  const location = useLocation();
  
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-left">
        <Link to="/" className="brand">Design Studio</Link>
        <NavLink 
          to="/models" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Models
        </NavLink>
        <NavLink 
          to="/roles" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Roles
        </NavLink>
        <NavLink 
          to="/mappings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Mappings
        </NavLink>
        <NavLink 
          to="/collaboration" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Collab
        </NavLink>
        <NavLink 
          to="/device" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Device
        </NavLink>
      </div>
      <div className="nav-right">
        <button 
          className="btn small" 
          onClick={onToggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
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
