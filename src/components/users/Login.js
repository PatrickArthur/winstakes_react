import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken, getProfile } from '../../services/authService';
import ProfileForm from '../profiles/ProfileForm';
import './Login.css';

const Login = ({ setIsLoggedIn, setHasProfile}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Email and password cannot be empty');
      return;
    }

    try {
      const response = await login(email, password);
      const profile_id = getProfile();
      setIsLoggedIn(true);
      if (profile_id == null || profile_id == "null") {
        setHasProfile(false)
        navigate('/create-profile');
      } else {
        setHasProfile(true)
        navigate('/');
      }
    } catch (error) {
      setError(String(error) || 'An error occurred');
      console.error('Invalid login credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Log in to Winstakes</h2>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <p className="login-error">{error}</p>}
        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="login-button">
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;