import React, { useState } from 'react';
import { getToken, getProfile, getAvatar } from '../../services/authService';
import { submitWonk } from '../../services/wonkService';
import './PostingPage.css';

const PostingPage = () => {
  const [postContent, setPostContent] = useState('');
  const [postTarget, setPostTarget] = useState('profile'); // 'profile' or 'challenge'
  const [challengeId, setChallengeId] = useState(''); // Used if posting to a challenge
  const [showChallengeList, setShowChallengeList] = useState(false);
  const api_url = 'http://localhost:4000'; //
  const token = getToken();
  const userAvatar = getAvatar();
  const [challenges, setChallenges] = useState([]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitWonk(api_url, token, postContent, setPostContent, challengeId ? challengeId : null);
  };

  const handlePostTargetChange = (event) => {
    const target = event.target.value;
    setPostTarget(target);
    if (target === 'profile') {
      setChallengeId('');
    }
  };

  const handleChallengeClick = (id) => {
    setChallengeId(id);
  };

  return (
    <div className="posting-page">
      <div className="posting-container">
        <img src={`${api_url}${userAvatar}`} alt="User Avatar" className="user-avatar" />
        <form onSubmit={handleSubmit}>
          <div className="post-box">
            <textarea
              placeholder="What's happening?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows="4"
              cols="50"
              className="post-textarea"
            />
          </div>
          
          <div className="dropdown">
            <label htmlFor="post-target" className="dropdown-label">Post To: </label>
            <select id="post-target" value={postTarget} onChange={handlePostTargetChange} className="dropdown-select">
              <option value="profile">Profile</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

           {postTarget === 'challenge' && (
              <div id="challenge-list">
                <p>Select a challenge to post to:</p>
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    className={`challenge-btn ${challengeId === challenge.id ? 'selected' : ''}`}
                    onClick={() => handleChallengeClick(challenge.id)}
                  >
                    {challenge.name}
                  </button>
                ))}
              </div>
            )}

          <button type="submit" className="submit-button">Submit Post</button>
        </form>
      </div>
    </div>
  );
};

export default PostingPage;