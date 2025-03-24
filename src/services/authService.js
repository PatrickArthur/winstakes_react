import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000'; // Replace this with your API's base route


export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      user: {
        email: email,
        password: password
      }
    });

    if (response.status === 200) {
      const token = response.data.token;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('profile_id', response.data.data.profile_id);
      localStorage.setItem('avatar_url', response.data.data.photo_url);
      setAuthToken(token);
      console.log('Login successful:', response.data);
    }
  } catch (error) {
    // Handle errors (like network errors or wrong credentials)
    throw new Error(error.response.data);

    console.error('Error logging in:', error.response ? error.response.data : error.message);
  }
};

export const signup = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      user: {
        email: email,
        password: password
      }
    });

    if (response.status === 200) {
      console.log('Login successful:', response.data);
    }
  } catch (error) {
    // Handle errors (like network errors or wrong credentials)
    throw new Error(error.response.data.status.message);
    console.error('Error logging in:', error.response ? error.response.data : error.message);
  }
};

export const logout = async () => {
  const token = getToken();  // Fetch the JWT from local storage or any other storage mechanism

  if (!token) {
    console.error('No JWT found, user might already be logged out');
    return;
  }

  const removeToken = () => {
    localStorage.removeItem('token');  // Remove JWT from the storage\
    localStorage.removeItem('profile_id');  // Remove profile id from the storage
    localStorage.removeItem('avatar_url');  // Remove profile id from the storage 
    window.location.href = '/';
  };

  try {
    const response = await axios.delete(`${API_URL}/logout`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Attach the token in the Authorization header
      }
    });

     if (!response.ok) {
      if (response.status === 401) {
        // Handle the revoked token case specifically
        console.warn('Token has been revoked or is invalid');
        removeToken();
        return;
      }
      throw new Error('Network response was not ok: ' + response.statusText);
    }

    console.log('Logged out successfully');
    removeToken();
  } catch (error) {
    console.error('Logout request failed:', error);
    // Ensure the token is removed regardless of fetch failure
    removeToken();
  }
}

export const getToken = () => {
  return localStorage.getItem('token');
}

export const getProfile = () => {
  return localStorage.getItem('profile_id');
}

export const getAvatar = () => {
  return localStorage.getItem('avatar_url');
}