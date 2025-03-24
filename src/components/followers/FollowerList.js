import React, { useEffect, useState } from 'react';
import './FollowerList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {  faUserPlus, faUserMinus, faComments, faEdit, faGavel, faUserCheck } from '@fortawesome/free-solid-svg-icons';

const FollowerList = ({ profileId, token, listType }) => {
  const [followers, setFollowers] = useState([]);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base routex
  const storedProfileId = localStorage.getItem('profile_id');
  const [followStatus, setFollowStatus] = useState({});
  const [activeTab, setActiveTab] = useState('followers');

  const fetchUsers = async () => {
    const endpoint = activeTab.charAt(0) + activeTab.slice(1)
    try {
      const response = await fetch(`${API_URL}/users/${profileId}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFollowers(data.profiles);
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}:`, error.message);
    }
  };

  useEffect(() => {
    console.log('profileId:', profileId, 'listType:', activeTab);
    if (profileId) {
      fetchUsers();
    }
  }, [profileId, activeTab]);

  const handleFollow = async (profileId, follow) => {
    try {
      let url = `${API_URL}/relationships`;
      let options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Ensure the token is included in the header
        },
        body: JSON.stringify({ follower_id: profileId })
      };

      if (!follow) {
        
        url = `${API_URL}/relationships/${profileId}?current_user=${storedProfileId}`;
        options = {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
          // For DELETE, you probably don't need a body since the relationship ID typically suffices.
        };
      }

      const response = await fetch(url, options);

      if (response.ok) {

        setFollowers((prevFollowers) =>
          prevFollowers.map(follower =>
            follower.id == profileId 
              ? { ...follower, is_following: follow } 
              : follower
          )
      );
        console.log(follow ? 'Followed successfully' : 'Unfollowed successfully');
      } else {
        console.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error while updating follow status:', error);
    }
  };
  return (
      <div className="followers-card">
        <div className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
          <Link to={`/profile/${profileId}`} className="profile-link">
            back to profile
          </Link>
        </div>
        <div className="followers-tabs">
          <button
            className={`tab-link ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
          <button
            className={`tab-link ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>


        <div className="follower-list">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <ul>
            {followers.map((follower) => {
               const isFollowed = follower.is_following;
                return (
                  <li key={follower.id} className="follower-item">
                    <img
                      src={follower.photo_url ? `${API_URL}${follower.photo_url}` : '/path/to/default/image.jpg'}
                      alt={`${follower.email}'s avatar`}
                      className="follower-avatar"
                    />
                    <a href={`/profile/${follower.id}`} className="follower-name">
                      {follower.email}
                    </a>
                     {follower.id != storedProfileId && (
                        isFollowed ? (
                          <button className="unfollow-btn" onClick={() => handleFollow(follower.id, false)}>
                            <FontAwesomeIcon icon={faUserCheck} className="icon" /> Unfollow
                          </button>
                        ) : (
                          <button className="follow-btn" onClick={() => handleFollow(follower.id, true)}>
                            <FontAwesomeIcon icon={faUserPlus} className="icon" /> Follow
                          </button>
                        )
                      )}
                  </li>
              );
          })}
          </ul>
        </div>
      </div>
  );
};

export default FollowerList;