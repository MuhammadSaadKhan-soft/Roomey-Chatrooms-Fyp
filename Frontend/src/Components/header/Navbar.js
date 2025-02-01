// Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faUser, faPlusSquare, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import "../css/navbar.css";
const Navbar = ({ mode, toggleMode, toggleSidebar }) => {
  const { auth, logout } = useContext(AuthContext);

 

  return (
    <nav 
    style={{ height: '65px' }}
    className={`navbar navbar-expand navbar-${mode} custom-navbar glowing-border`}
  >
      
      <div className="container-fluid">
      <Link className="navbar-brand" onClick={toggleSidebar}>
      
      <FontAwesomeIcon style={{color:'white'}}icon={faBars} />
     
    </Link>
        <button
        style={{border:"1px solid blue"}}
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
         
        >
          <span className="navbar-toggler-icon" ></span>
        </button>
        

        <h5 className="stripe" >Roomey Chat</h5>
       
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
        
          <marquee behavior="scroll"  style={{ color: 'white' }} className="marquee-text">
            Welcome to Roomey Chat! Join a room and start chatting!
          </marquee>
        
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
         
        </div>
          <div className="d-flex align-items-center">
        
          <div className="marquee-container">
        
            {auth.isAuthenticated ? (
              <div style={{ display: 'flex',marginTop:"20px", alignItems: 'center' }}>
              {/* <Link className={`btn btn-${mode === 'light' ? 'dark' : 'light'} me-2`}  style={{border:"1px solid blue"}} to="/admin_panel">
                <FontAwesomeIcon icon={faPlusSquare} /> Admin Panel
            </Link> */}
             <Link className={`btn btn-${mode === 'light' ? 'dark' : 'light'} me-2`} style={{border:"1px solid blue"}} to="/profileManagement">
                <FontAwesomeIcon icon={faUser} /> Profile
            </Link>
            <Link className={`btn btn-${mode === 'light' ? 'dark' : 'light'} me-2`}  style={{border:"1px solid blue"}} to="/create_room">
                <FontAwesomeIcon icon={faPlusSquare} /> CreateRoom
            </Link>

            <button  style={{border:"1px solid blue"}} className={`btn btn-${mode === 'light' ? 'dark' : 'light'} me-2`} onClick={logout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
            </div>
            ) : (
              <div style={{marginTop:'18px'}}>
             
             <Link className={`btn btn-${mode === 'light' ? 'dark' : 'light'} me-2`} style={{border:"1px solid blue"}} to="/login">
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> Login
            </Link>
            <Link className={`btn btn-${mode === 'light' ? 'dark' : 'light'}`} style={{border:"1px solid blue"}} to="/registration">
                <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Signup
            </Link>
              </div>
            )}
            <div className={`form-check form-switch text-${mode === 'light' ? 'dark' : 'light'} ms-3`}>
              {/* <input
                className="form-check-input"
                type="checkbox"
                onClick={toggleMode}
                role="switch"
                id="flexSwitchCheckDefault"
              /> */}
              {/* <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
              </label> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
