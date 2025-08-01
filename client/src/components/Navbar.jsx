// Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isAuthenticated = localStorage.getItem('token')!== null

  return (
    <nav className="navbar">
      <div className="navbar__brand">📝 Todo App</div>
      {isAuthenticated &&
      <button className="navbar__logout" onClick={handleLogout}>
        Logout
      </button>
      }
    </nav>
  );
};

export default Navbar;
