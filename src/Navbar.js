import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logout, getProfile, getToken, getAvatar } from './services/authService';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import consumer from "./consumer"
import './Navbar.css';

const Navbar = ({ isLoggedIn, hasProfile}) => {
	const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const token = getToken();
	
	return (
         <nav className="navbar navbar-light bg-light">
          <div className="container-fluid d-flex align-items-center justify-content-between">
            {isLoggedIn && hasProfile && (
              <div className="navbar-left">
                <ProfileIcon apiUrl={API_URL}/>
              </div>
            )}

            <div className="mx-auto text-center">
              <Link className="navbar-brand" to="/">
                Winstakes
              </Link>
            </div>

            {isLoggedIn && hasProfile && (
              <div className="navbar-right">
                <Link to="/tokens/purchase" className="btn btn-primary">
                  Buy Tokens
                </Link>
              </div>
            )}
          </div>
        </nav>
	);

};


function ProfileIcon({apiUrl}) {
  return (
    <Link className="nav-link position-relative" to={`/profile/${getProfile()}`}>
        {/* Render profile picture if URL is available, fall back to icon otherwise */}
        {getAvatar() ? (
          <img
            src={`${apiUrl}${getAvatar()}`} 
            alt="Profile"
            className="rounded-circle"
            style={{ width: '40px', height: '40px' }}
          />
        ) : (
          <i className="fas fa-user-circle"></i>
        )}
      </Link>
  );
}


export default Navbar;