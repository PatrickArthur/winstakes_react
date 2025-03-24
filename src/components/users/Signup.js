import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate('/login');
    } catch (error) {
      setError(String(error) || 'An error occurred');
      console.error('Signup failed');
    }
  };

  return (
     <div className="signup-container">
      <h2 className="signup-heading">Create your account</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        {error && <p className="signup-error">{error}</p>}
        <div className="form-group">
          <label htmlFor="email" className="signup-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="signup-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="signup-button">Sign up</button>
      </form>
    </div>
  );
};

export default Signup;