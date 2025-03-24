import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation
import './ProfilesFeed.css';

// Define URL endpoint
const API_URL = 'http://localhost:4000'; // Replace this with your API's base route

const ProfilesFeed = () => {
    const [profiles, setProfiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const storedProfileId = localStorage.getItem("profile_id");
    
     const filteredProfiles = profiles.filter(profile => {
        // Converting both IDs to string for proper comparison
        const profileIdAsString = profile.id.toString();
        const isDifferentProfile = profileIdAsString !== storedProfileId;

        // Debug log for each profile checked
        console.log(`Checking profile ID: ${profileIdAsString}, Include: ${isDifferentProfile}`);
        
        return isDifferentProfile;
      });
    const api = axios.create({
      baseURL: 'http://localhost:4000', // Modify to your rails server URL
      headers: { 'Content-Type': 'application/json' }
    });

    api.interceptors.request.use(config => {
      // Add authorization token here if needed
      config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      return config;
    });

    const fetchProfiles = () => api.get(`/profiles`);

    useEffect(() => {
        // Fetch all users (or apply pagination as needed)
        handleFetchProfiles();
    }, []);

    const handleFetchProfiles = async () => {
        const response = await fetchProfiles();
        setProfiles(response.data.profiles);
        setLoading(false);
        console.log(profiles)
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <ul className="profile-list">
          {filteredProfiles.map((profile) => (
            <li key={profile.id} className="profile-item">
              {profile.photo_url && (
                <div className="profile-image-container">
                  <img
                    src={`${API_URL}${profile.photo_url}`}
                    alt={`${profile.name}'s Profile`}
                    className="profile-image"
                  />
                </div>
              )}
              <div className="profile-info">
                <Link to={`/profile/${profile.id}`} className="profile-link">
                  <h2 className="profile-email">{profile.email}</h2>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      );
    };

export default ProfilesFeed;