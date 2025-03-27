import React, { useEffect, useState } from 'react';
import consumer from '../../consumer';
import './entries.css'; // Your CSS file
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { isVotingOpen, canUserVote } from "../voting/votingHelpers";
import VoteButton from "../voting/VoteButton";
import { fetchProfile } from '../../services/profileService';

const ChallengeEntries = ({token, challengeId, profileId}) => {
    const [challenge, setChallenge] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
    const [participant, setParticipant] = useState(false);
    const [creatorId, setCreatorId] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [isFollowerOfCreator, setIsFollowerOfCreator] = useState(false); 
    const [entries, setEntries] = useState([]);
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

      const fetchChallenge = async () => {
        try {
          const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch challenge');

          const data = await response.json();
          setChallenge(data.challenge);
          setCreatorId(data.challenge.creator_id)
          setParticipant(data.challenge.challenge_participants.filter(challenge => challenge.profile_id == profileId && challenge.challenge_id == challengeId)[0])
          setIsParticipant(data.challenge.challenge_participants.some(challenge => challenge.profile_id == profileId))
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
        // Fetch initial list of entries
      const fetchEntries = async () => {
        try {
          const response = await fetch(`${API_URL}/challenges/${challengeId}/entries`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Error fetching entries');
          }
   
          const data = await response.json();
          const entries = Array.isArray(data) && data.length > 0 ? data : data.entries;
          setEntries(entries);
          setIsEntered(entries.some(challenge => challenge.challenge_participant.profile_id == profileId))
        } catch (error) {
          console.error('Error fetching entries:', error);
        }
      };

      const fetchUserProfile = async () => {
        await fetchProfile(API_URL, creatorId, token, setIsFollowerOfCreator);
      }

      fetchEntries();
      fetchChallenge();
      fetchUserProfile();

        // Subscribe to Action Cable channel
      const subscription = consumer.subscriptions.create(
        { channel: "EntriesChannel" },
        {
          received(data) {
            const { entry, action } = data;

            setEntries((prevEntries) => {
              switch (action) {
                case "destroy":
                  return prevEntries.filter((e) => e.id !== entry.id);
                default:
                  return prevEntries;
              }
            });
          },
        }
      );

      return () => {
        subscription.unsubscribe();
      };
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

    if (loading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    const sortedEntries = [...entries].sort((a, b) => {
      // Primary sort by votes (descending)
      if (b.vote_count !== a.vote_count) {
        return b.vote_count - a.vote_count;
      }
      // Secondary sort by score (descending) if votes are the same
      else if (b.weighted_score !== a.weighted_score) {
        return b.weighted_score - a.weighted_score;
      }
      // Tertiary sort by created_at (descending) if both votes and score are the same
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    return (
      <div>
          <h4>Challenge Entries</h4>
            {sortedEntries.length <= 0 ? (
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
                  {sortedEntries.map((participant, index) => (
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
                            <VoteButton api_url={API_URL} token={token} entryId={participant.id} challengeId={challenge.id} profileId={profileId}/>
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