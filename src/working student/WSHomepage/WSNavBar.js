import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import './WSNavBar.css';

const WSNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/wshomepage' },
    { name: 'Report', path: '/wsreport' },
    { name: 'Leaderboard', path: '/wsleaderboards' },
    { name: 'Insight', path: '/insightanalytics' },
    { name: 'Profile', path: '/wsprofile' }
  ];

  // Function to check if a link is active
  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="ws-navbar">
      {/* Logo */}
      <img
        src="/TITLE.png"
        alt="Logo"
        className="ws-title"
      />
      {/* Desktop Navigation Links */}
      <div className="nav-links">
        {navLinks.map((link) => (
          <div
            key={link.name}
            onClick={() => navigate(link.path)}
            className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
          >
            {link.name}
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="nav-toggle-icon"
        >
          <path
            fillRule="evenodd"
            d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            {navLinks.map((link) => (
              <div
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className={`mobile-nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
              >
                {link.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default WSNavBar;