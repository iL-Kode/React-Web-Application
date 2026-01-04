import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  return (
    <div className="sidebar">
      <div>
        <h3 className="sidebar-brand">Facebook?</h3>
      </div>
      
      <nav className="sidebar-navigation">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Hem
        </Link>
        <Link 
          to="/search" 
          className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
        > Sök Användare </Link>
        <Link
          to="/friends"
          className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}
        >
          Vänner 
        </Link>
        <Link
          to="/chat"
          className={`nav-link ${location.pathname.startsWith('/chat') ? 'active' : ''}`}
        >
          Chatt
        </Link>
      </nav>
      
      <div>
        <div className="user-info">
          <p className="user-name">{user.username}</p>
        </div>
        <button onClick={logout} className="btn btn-outline-danger btn-sm w-90"> Logga ut </button>
      </div>
    </div>
  );
};

export default Navigation;
