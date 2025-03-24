import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link} from 'react-router-dom';
import axios from 'axios';
import { login, getToken } from '../../services/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faUserPlus, faUserMinus, faComments, faEdit, faGavel, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import consumer from '../../consumer';
import './Profiles.css';
import { CurrentUserProfile, fetchWonks, wonkSubscription, useInfiniteScroll } from '../../services/wonkService';
import WonkView from '../wonks/WonkView';

const Profile = ({ token , profileId}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wonks, setWonks] = useState([]);
  const [newWonkContent, setNewWonkContent] = useState('');
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base routex
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To check if more data is available
  const [page, setPage] = useState(1);
  const [isFollowed, setIsFollowed] = useState(false);
  const [relationshipId, setRelationshipId]= useState(null);
  const storedProfileId = localStorage.getItem('profile_id');

  useEffect(() => {
     if (token && profileId) {
        fetchUserProfile();
        fetchFavoriteJudges();
        fetchWonkData();
     }

    const subscription = wonkSubscription(consumer, profileId, null, setWonks);

    return () => {
       if (subscription) {
         consumer.subscriptions.remove(subscription);
       }
    };
  }, [token, profileId, page]);

  useEffect(() => {
    const scrollHandler = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [hasMore]);

  const fetchUserProfile = async () => {
       setLoading(true);
       try {
         const response = await axios.get(`${API_URL}/profiles/${profileId}`, {
           headers: { Authorization: `Bearer ${token}` }
         });
         setIsFollowed(response.data.profile.followers.includes(Number(storedProfileId)))
         localStorage.getItem('profile_id')
         setProfile(response.data.profile);
       } catch (err) {
         setError("Error fetching profile");
       } finally {
         setLoading(false);
       }
  };

  const fetchFavoriteJudges = async () => {
        try {
          const response = await fetch(`${API_URL}/favorite_judges`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // Handle HTTP errors
            console.error('HTTP error', response.status, response.statusText);
            return;
          }

          const data = await response.json();
          const favorite_judge = data.favorite_judges.map((judge) => judge.profile.id).includes(Number(profileId))
          setIsFavorited(favorite_judge)

        } catch (error) {
          console.error('Error fetching profile wonks', error);
        }
  };

  const fetchWonkData = async () => {
    await fetchWonks(API_URL, token, profileId, null, setWonks, setHasMore, page);
  };


  const addJudgeHandler = async (profile) => {
    try {
      const response = await fetch(`${API_URL}/judgeships/${profile.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to add the user as a judge.');
      }
      
      const data = await response.json();
      console.log('User added as judge:', data);
      setIsFavorited(true)
    } catch (error) {
      console.error('Error adding user as judge:', error);
    }
  };

  const removeJudgeHandler = async (profile) => {
    try {
      const response = await fetch(`${API_URL}/judgeships/${profile.id}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove the user as a judge.');
      }
      
      console.log('User removed as judge');
      setIsFavorited(false);
    } catch (error) {
      console.error('Error removing user as judge:', error);
    }
  };

  const loadMoreWonks = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleCreateChat = async (event, user2_id) => {
    event.preventDefault();

    try {
        if (!token) {
            throw new Error("Token not found or invalid");
        }
        const response = await fetch(`${API_URL}/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({user2_id: user2_id})
        });

        const data = await response.json();

        if (response.ok) {  // Check if response is successful
            navigate(`/chat/${data.chat.id}`);  // Correct the template string here
        } else {
            console.error('Could not create Chat:', data.errors);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  };

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
        // Update the follow status locally
        setIsFollowed(follow);
        fetchUserProfile();
        console.log(follow ? 'Followed successfully' : 'Unfollowed successfully');
      } else {
        console.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error while updating follow status:', error);
    }
  };

  useInfiniteScroll(loadMoreWonks, hasMore);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  
  return (
    profile ? (
      <div className="profile-container">
        <div className="user-profile">
          <h2>Profile</h2>
          {profile.is_judge && (
            <span title="This user is a judge">
              <FontAwesomeIcon 
                icon={faGavel} 
                style={{ 
                  color: 'white', 
                  fontSize: '20px', // Increase icon size
                  backgroundColor: 'gold', // Set background color to gold
                  borderRadius: '50%', // Make it circular
                  padding: '10px', // Adjust padding to size the circle
                  marginLeft: '5px' // Maintain margin from neighboring elements
                }} 
              />
            </span>
          )}
        </div>
        <div className="profile-header">
          {profile.photo_url && (
            <div className="profile-image-container">
              <img
                src={`${API_URL}${profile.photo_url}`}
                alt={profile.name}
                width="100"
                height="100"
                className="profile-image"
              />
            </div>
          )}
          <div className="profile-details">
            <p>First Name: {profile.first_name}</p>
            <p>Last Name: {profile.last_name}</p>
            <p>Email: {profile.email}</p>
            
            {CurrentUserProfile(profileId) && (
              <p><b>Token Count:</b> {profile.tokens}</p>
            )}

            <div className="profile-card">
              {profile.is_judge && (
                <>
                  <p>Bio: {profile.bio}</p>
                  <p>Category: {profile.category}</p>
                </>
              )}

              {!CurrentUserProfile(profileId) && (
                <div>
                  {isFavorited ? (
                    <button className="button button-remove" onClick={() => removeJudgeHandler(profile)}>
                      <FontAwesomeIcon icon={faUserMinus} className="icon" />
                      Remove Judge
                    </button>
                  ) : (
                    <button className="button button-add" onClick={() => addJudgeHandler(profile)}>
                      <FontAwesomeIcon icon={faUserPlus} className="icon" />
                      Add as Judge
                    </button>
                  )}
                  {isFollowed ? (
                      <button className="button button-unfollow" onClick={() => handleFollow(profileId, false)}>
                        <FontAwesomeIcon icon={faUserCheck} className="icon" />
                         Unfollow
                      </button>
                    ) : (
                      <button className="button button-follow" onClick={() => handleFollow(profileId, true)}>
                        <FontAwesomeIcon icon={faUserPlus} className="icon" />
                        Follow
                      </button>
                  )}
                  <button className="button button-message" onClick={(event) => handleCreateChat(event, profileId)}>
                    <FontAwesomeIcon icon={faComments} className="icon" />
                    Message
                  </button>
                </div>
              )}

              <div className="profile-stats">
                <Link to={`/${profile.id}/followers`} className="stat-link">
                  {profile.followers_count} <span className="stat-label">Followers</span>
                </Link>
                <Link to={`/${profile.id}/following`} className="stat-link">
                  {profile.followed_count} <span className="stat-label">Following</span>
                </Link>
              </div>
            </div>
          </div>
          {CurrentUserProfile(profileId) && (
            <FontAwesomeIcon
              icon={faEdit}
              className="edit-icon"
              onClick={() => navigate('/edit-profile')}
            />
          )}
        </div>
        <WonkView wonks={wonks} profileId={profileId} setWonks={setWonks} newWonkContent={newWonkContent} setNewWonkContent={setNewWonkContent} challengeId={null} hasMore={hasMore} />
      </div>
    ) : (
      <p>No profile data</p>
    )
  );
};

export default Profile;