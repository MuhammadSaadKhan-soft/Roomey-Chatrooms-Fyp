import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignInAlt, faUserPlus, faUser, faPlusSquare, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ mode, toggleSidebar }) => {
  const { auth, logout } = useContext(AuthContext);
  const [showLinks, setShowLinks] = useState(false);

  const handleSidebarToggle = (e) => {
    e.preventDefault(); // Prevent page reload when the sidebar icon is clicked
    toggleSidebar();    // Toggle sidebar visibility
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-${mode} bg-${mode === 'light' ? 'light' : 'dark'} shadow-sm`}>
      <div className="container-fluid">
        {/* Navbar Toggle Button for Mobile */}
       

        {/* Navbar Brand (Sidebar Icon) */}
        <Link className="navbar-brand" onClick={handleSidebarToggle}> {/* Prevent link behavior */}
          <FontAwesomeIcon icon={faBars} />
        </Link>

        {/* Dropdown Icon to Toggle Nav Links (Right) */}
        <button
          className="btn btn-outline-secondary d-lg-none"
          onClick={() => setShowLinks(!showLinks)} // Toggle nav links visibility
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </button>

        {/* Navbar Links & Actions */}
        <div className={`collapse navbar-collapse ${showLinks ? 'd-block' : 'd-none'} d-lg-flex`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <marquee behavior="scroll" className="text-dark" style={{ fontSize: '14px' }}>
                Welcome to Roomey Chat! Join a room and start chatting!
              </marquee>
            </li>

            {/* Conditional Links Based on Authentication */}
            {auth.isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`btn btn-${mode === 'light' ? 'dark' : 'light'} btn-sm me-2`}
                    to="/profileManagement"
                  >
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`btn btn-${mode === 'light' ? 'dark' : 'light'} btn-sm me-2`}
                    to="/create_room"
                  >
                    <FontAwesomeIcon icon={faPlusSquare} /> Create Room
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className={`btn btn-${mode === 'light' ? 'dark' : 'light'} btn-sm me-2`}
                    onClick={logout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`btn btn-${mode === 'light' ? 'dark' : 'light'} btn-sm me-2`}
                    to="/login"
                  >
                    <FontAwesomeIcon icon={faSignInAlt} /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`btn btn-${mode === 'light' ? 'dark' : 'light'} btn-sm`}
                    to="/registration"
                  >
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
