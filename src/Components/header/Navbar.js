import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faSignInAlt, faUserPlus, faUser, faPlusSquare, faSignOutAlt, faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ themes, toggleMode, toggleSidebar }) => {
  const { auth, logout } = useContext(AuthContext);
  const [showLinks, setShowLinks] = useState(false);

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    toggleSidebar();
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${themes ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}
    >
      <div className="container-fluid">

        {/* Sidebar Toggle */}
        <Link className="navbar-brand" to="#" onClick={handleSidebarToggle}>
          <FontAwesomeIcon icon={faBars} />
        </Link>

        {/* Mobile Dropdown Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setShowLinks(!showLinks)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Collapse Section */}
        <div className={`collapse navbar-collapse ${showLinks ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item me-2">
              <marquee behavior="scroll" className={`text-${themes ? 'light' : 'dark'}`} style={{ fontSize: '14px' }}>
                Welcome to Roomey Chat! Join a room and start chatting!
              </marquee>
            </li>

            <li className="nav-item me-2">
              <button onClick={toggleMode} className="btn btn-outline-secondary btn-sm">
                {themes ? '🌙 Dark' : '☀️ Light'}
              </button>
            </li>

            {auth.isAuthenticated ? (
              <>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-primary btn-sm" to="/profileManagement">
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-success btn-sm" to="/create_room">
                    <FontAwesomeIcon icon={faPlusSquare} /> Create Room
                  </Link>
                </li>
                <li className="nav-item me-2">
                  <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    <FontAwesomeIcon icon={faSignInAlt} /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-success btn-sm" to="/registration">
                    <FontAwesomeIcon icon={faUserPlus} /> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
