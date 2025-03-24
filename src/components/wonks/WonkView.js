import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faGavel } from '@fortawesome/free-solid-svg-icons';
import '../profiles/Profiles.css';
import { FaComment } from 'react-icons/fa';
import { CurrentUserProfile, deleteWonk, submitWonk } from '../../services/wonkService';
import moment from 'moment';
import { getToken, getProfile} from '../../services/authService';
import './WonkView.css';
import LikeButton from '../likes/LikeButton';

const WonkView = ({wonks, profileId, setWonks, newWonkContent, setNewWonkContent, challengeId, hasMore}) => {
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base routex

  const sortedWonks = [...wonks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const navigate = useNavigate();
  const storedProfileId = localStorage.getItem('profile_id');

  const formatDate = (dateString) => {
    return moment(dateString).fromNow();
  };

  const handleDelete = async (id) => {
    await deleteWonk(API_URL, token, id, setWonks);
  };

  const token = getToken();
  return (
    <div>
      {sortedWonks.length > 0 &&
        sortedWonks.map((wonk) => {
          const likedRecord = wonk.likes.find((like) => like.profile_id === storedProfileId);
          const likeId = likedRecord ? likedRecord.id : null;
          const initialLiked = wonk.likes.some(like => like.profile_id == storedProfileId)
          const wonkLikes = wonk.likes.length
          return (
            <div key={wonk.id} className="wonk-container" id={`wonk-${wonk.id}`}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {wonk.profile.photo_url && (
                  <img
                    src={`${API_URL}${wonk.profile.photo_url}`}
                    alt={wonk.profile.name}
                    width="50"
                    height="50"
                    style={{ marginRight: '10px' }}
                   />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <p style={{ margin: '0 10px' }}>by {wonk.user.email}</p>
                  <p style={{ margin: '0' }}>{formatDate(wonk.created_at)}</p>
                </div>
              </div>
              <div>
                {wonk.challenge_id ? (
                  <p style={{ marginTop: '10px' }}>
                    {wonk.content}{' '}
                    <Link to={`/challenges/${wonk.challenge_id}`}>Challenge Link</Link>
                  </p>
                ) : (
                  <p>{wonk.content}</p>
                )}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center', // Center itself within the flex container
                justifyContent: 'space-between',
                marginTop: '5px',
                width: '100%'
              }}>
                <a href={`/wonks/${wonk.id}`} style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-flex',      // Use inline-flex for consistent alignment
                  alignItems: 'center',        // Align items vertically
                  marginRight: '10px',         // Optional: Spacing between elements
                }}>
                  <FaComment style={{ marginRight: '5px' }} />
                  <span style={{ verticalAlign: 'middle' }}>{wonk.comments_count} comments</span>
                </a>

                {/* LikeButton Wrapper */}
                <span style={{
                  display: 'inline-flex',      // Consistent display type
                  alignItems: 'center'         // Align items vertically
                }}>
                  <LikeButton
                    api_url={API_URL}
                    token={token}
                    resourceType="wonk"
                    resourceId={wonk.id}
                    commentId={null}
                    initialLiked={initialLiked}
                    initialCount={wonkLikes}
                    likeId={likeId}
                  />
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                {CurrentUserProfile(wonk.profile.id) && (
                  <FontAwesomeIcon 
                    icon={faTrash} 
                    onClick={() => handleDelete(wonk.id)} 
                    style={{ cursor: 'pointer', color: 'red', marginLeft: 'auto' }}
                  />
                )}
              </div>
            </div>
        );
      })}
      {!hasMore && <p>No more wonks to load</p>}
    </div>
  );
};

export default WonkView;