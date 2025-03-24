import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logout,getProfile, getToken } from './services/authService';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import consumer from "./consumer"
import './Sidebar.css';

const Sidebar = ({ isLoggedIn, hasProfile}) => {
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const token = getToken();

	return (
         <div className="d-flex" style={{ height: '100vh' }}>
		      <nav className="navbar navbar-expand-lg navbar-light bg-light flex-column">
		        <div className="collapse navbar-collapse">
		          <ul className="navbar-nav flex-column">
                {isLoggedIn && hasProfile && <li className="nav-link"><Link className="nav-link" to="/challenges">All Challenges</Link></li>}
                {isLoggedIn && hasProfile && <li className="nav-link"><Link className="nav-link" to="/joined-challenges">Joined Challenges</Link></li>}
                {isLoggedIn && hasProfile && <li className="nav-link"><Link className="nav-link" to="/created-challenges">Created Challenges</Link></li>}
                {isLoggedIn && hasProfile && <li className="nav-link"><Link className="nav-link" to="/challenges/new">New Challenge</Link></li>}
          		</ul>
          	</div>
				</nav>
			</div>
	);

};


export default Sidebar;