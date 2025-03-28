import React, { useEffect, useState } from 'react';
import consumer from '../../consumer';
import './entries.css'; // Your CSS file
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { isVotingOpen, canUserVote } from "../voting/votingHelpers";
import VoteButton from "../voting/VoteButton";
import { fetchProfile } from '../../services/profileService';

const ChallengeEntries = ({token, challenge, profileId, creatorId}) => {
    const challengeId = challenge.id
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
    const [participant, setParticipant] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [isFollowerOfCreator, setIsFollowerOfCreator] = useState(false); 
    const [entries, setEntries] = useState(challenge.entries);
    const [isEntered, setIsEntered] = useState(false);
    const [fileDownload, setFileDownload] = useState(null);
    const [videoDownload, setVideoDownload] = useState(null);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('')
    const navigate = useNavigate();

    const handleRowClick = (challengeId, participantId, entryId) => {
      navigate(`/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`);
    };

    useEffect(() => {
       const sortedEntries = [...entries].sort((a, b) => {
         if (b.vote_count !== a.vote_count) {
           return b.vote_count - a.vote_count;
         } else if (b.weighted_score !== a.weighted_score) {
           return b.weighted_score - a.weighted_score;
         }
         return new Date(b.created_at) - new Date(a.created_at);
       });

       setEntries(sortedEntries);
     }, [challenge.entries]);

    useEffect(() => {
      const fetchUserProfile = async () => {
        await fetchProfile(API_URL, creatorId, token, setIsFollowerOfCreator);
      }

      fetchUserProfile();
    }, [token]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/${participant.id}/entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(e)
        });

        if (!response.ok) {
          throw new Error('Error creating entry');
        }

        return await response.json();
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    // Function to update an existing entry
    const updateEntry = async (entryId, updatedData, token) => {
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/${participant.id}/entries/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
          throw new Error('Error updating entry');
        }

        return await response.json();
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    // Function to delete an existing entry
    const deleteEntry = async (entryId, token) => {
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/${participant.id}/entries/${entryId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error deleting entry');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    
    return (
      <div>
            {entries.length <= 0 ? (
              <p>No entries for challenge.</p>
            ) : (
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Date Joined</th>
                    <th>File</th>
                    <th>Video</th>
                    <th>Evidence</th>
                    <th>Votes</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((participant, index) => (
                    <tr key={index}
                        onClick={() => handleRowClick(participant.challenge_participant.challenge_id, participant.challenge_participant.id, participant.id)}
                        style={{ cursor: 'pointer' }}
                    >
                      <td>{participant.challenge_participant.profile_name}</td>
                      <td>{participant.challenge_participant.user_email}</td>
                      <td>{new Date(participant.created_at).toLocaleDateString()}</td>
                      {participant.file_attachment && (
                        <td>
                          <img src={participant.file_attachment} alt="File Attachment" style={{ width: '100px', height: 'auto', marginRight: '10px'  }} />
                        </td>
                      )}
                       {participant.video_attachment && (
                          <td>
                            <video controls style={{ width: '100px', height: 'auto', marginRight: '10px'  }}>
                              <source src={participant.video_attachment} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </td>
                        )}
                        {participant.evidence_attachment_urls && (
                          <td>
                             {participant.evidence_attachment_urls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Evidence Attachment ${index + 1}`}
                                style={{ width: '100px', height: 'auto', marginRight: '10px' }}
                              />
                            ))}
                          </td>
                        )}
                        <td>{participant.vote_count}</td>
                        <td>{participant.weighted_score}</td>
                        {isVotingOpen(challenge) &&
                          canUserVote(challenge, isParticipant, isFollowerOfCreator) && (
                            <VoteButton api_url={API_URL} token={token} entryId={participant.id} challengeId={challengeId} profileId={profileId}/>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
    );
};

export default ChallengeEntries;