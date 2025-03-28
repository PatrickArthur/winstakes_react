import React, { useEffect, useState } from 'react';
import './ChallengeParticpants.css'; // Your CSS file
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const ChallengeParticpants = ({token, challenge, creatorId, profileId}) => {
    const challengeId = challenge.id
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
    const navigate = useNavigate();
    const [participants, setParticipants] = useState(challenge.challenge_participants);
    const isCreator = creatorId == profileId

    const handleDelete = async (participantId) => {
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to delete challenge');
        
        setParticipants((prevParticipants) => 
          prevParticipants.filter((challenge) => challenge.id !== participantId)
        );
      } catch (err) {
        setError(err.message);
      }
    };

    if (!participants) {
      return <p>No challenge participants data available.</p>;
    }
    
    const sortedParticipants = [...participants].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
    return (
      <div className="participants-container">
            {sortedParticipants.length <= 0 ? (
              <p>No participants have joined yet.</p>
            ) : (
              <table className="participants-list">
                <thead>
                  <tr>
                    <th></th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.map((challenge, index) => (
                    <tr key={index}>
                      <td>
                        <Link to={`/profile/${challenge.profile_id}`} className="profile-link">
                          {challenge.photo_url && (
                            <img
                              src={`${API_URL}${challenge.photo_url}`}
                              alt={`${challenge.profile_name}'s Profile`}
                              className="profile-image"
                            />
                          )}
                        </Link>
                      </td>
                      <td>{challenge.profile_name}</td>
                      <td>{challenge.user_email}</td>
                      <td>{new Date(challenge.created_at).toLocaleDateString()}</td>
                      {isCreator && (
                        <td>
                          <button 
                            className="icon-button"
                            onClick={() => handleDelete(challenge.id)}
                          >
                            <i className="fa-solid fa-trash button-icon-cp"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>
    );

};

export default ChallengeParticpants;