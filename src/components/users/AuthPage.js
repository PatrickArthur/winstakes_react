import React from 'react';
import { Link } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  return (
     <div className="auth-page">
      <div className="auth-content">
        <h1>Welcome to Winstakes</h1>
        <p>Challenge yourself, compete with others, connect and win prizes.</p>
        <div className="button-container">
          <Link to="/login" className="auth-button login-button">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
          <Link to="/signup" className="auth-button signup-button">
            <i className="fas fa-user-plus"></i> Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;