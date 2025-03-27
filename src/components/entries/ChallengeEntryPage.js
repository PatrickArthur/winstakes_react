import React, { useEffect, useState } from 'react';
import './entries.css'; // Your CSS file
import consumer from '../../consumer';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp } from 'react-icons/fa';
import { fetchProfile } from '../../services/profileService';
import { isVotingOpen, canUserVote } from "../voting/votingHelpers";
import VoteButton from "../voting/VoteButton";


const ChallengeEntryPage = ({ token, challengeId, participantId, entryId}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entry, setEntry] = useState(null);
  const API_URL = 'http://localhost:4000';
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isEntered, setIsEntered] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const profileId = localStorage.getItem('profile_id')
  const [hasVoted, setHasVoted] = useState(false);
  const [creatorId, setCreatorId] = useState(false);
  const [isFollowerOfCreator, setIsFollowerOfCreator] = useState(false); 

  const fetchEntryData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,  // Include the token in the request headers
              'Content-Type': 'application/json'
            },
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEntry(data.entry);
        setIsEntered(data.entry.challenge_participant.profile_id == profileId)
        setCreatorId(data.entry.challenge.creator_id)
        setIsCreator(data.entry.challenge_participant.creator_id == profileId)
      } catch (error) {
        console.error('Fetch error:', error);
      }
  };

  const fetchVote = async () => {
    try {
      const response = await fetch(
        `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}/votes/check?profile_id=${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Include the token in the request headers
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHasVoted(data.voted)
      } catch (error) {
        console.error('Fetch error:', error);
      }
  };

  const fetchUserProfile = async () => {
    await fetchProfile(API_URL, creatorId, token, setIsFollowerOfCreator);
  }


  useEffect(() => {
     
    const setupSubscription = () => {
      const subscription = consumer.subscriptions.create(
        { channel: 'EntriesChannel', challenge_id: challengeId, participant_id: participantId, entry_id: entryId },
        {
          received(data) {
            console.log('Received data via ActionCable:', data);
            setEntry(data);
          },
          connected() {
            console.log(`Connected to EntriesChannel for entry: ${entryId}`);
          },
          disconnected() {
            console.log('Disconnected from EntriesChannel');
          },
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchEntryData();
    fetchVote();

    return setupSubscription();
  }, [challengeId, participantId, entryId]);

  const handleDelete = async () => {
    try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to delete challenge');

        // Handle successful deletion (e.g., redirect or display a message)
        navigate(`/challenges/${challengeId}/entries`); 
        alert('Challenge deleted successfully.');
      } catch (err) {
        setError(err.message);
      }
  };

  const handleEdit = (id) => {
    navigate(`/challenges/${challengeId}/entries/${participantId}/${id}`);
  };

  const voteForEntry = async () => {
    const url = `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}/votes`;
    try {
      const response =  await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
        },
        body: JSON.stringify({
          profile_id: profileId  // Include user ID in the request, if required by your API
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to cast vote: ${response.statusText}`);
      }

      await response.json()

      alert('Vote cast successfully');
      fetchEntryData();
      setHasVoted(true);
    } catch (error) {
      console.error('Error casting vote:', error); // Handle error here
    }
  };

  if (!entry) {
    return <div>No entry available</div>;
  }
  console.log(entry)
  return (
    <div className="entry-container">
      <div className="entry-header">
        <h2 className="entry-profile-name">{entry.challenge_participant.profile_name}</h2>
      </div>
      <div className="entry-user-email">
        <p>{entry.challenge_participant.user_email}</p>
      </div>
      <div className="entry-current-score">
        <p className="score-detail"><strong>Total Votes:</strong> {entry.vote_count}</p>
        <p className="score-detail"><strong>Current Score:</strong> {entry.weighted_score}</p>
      </div>
      <div className="attachments-section">
        <h3>Attachments</h3>
        <div className="attachment-item">
          <p>File: 
            <img
              src={entry.file_attachment}
              alt="File Attachment"
              className="attachment-thumbnail"
            />
          </p>
        </div>
        <div className="attachment-item">
          <p>Video: 
            <video controls className="video-thumbnail">
              <source src={entry.video_attachment} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </p>
        </div>
        <h4>Evidence Attachment URLs</h4>
        <ul className="attachment-list">
          {entry.evidence_attachment_urls.map((url, index) => (
            <li key={index}>
              <img
                src={url}
                alt={`Evidence Attachment ${index + 1}`}
                className="attachment-image"
              />
            </li>
          ))}
        </ul>
      </div>
       <div className="entry-actions">
        {isEntered && (
          <button className="edit-button" onClick={() => handleEdit(entry.id)}>
            Edit
          </button>
        )}
        {(isEntered || isCreator) && (
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
        )}
        {isVotingOpen(entry.challenge) &&
          canUserVote(entry.challenge, isEntered, isFollowerOfCreator) && (
            <VoteButton api_url={API_URL} token={token} entryId={entry.id} challengeId={entry.challenge.id} profileId={profileId}/>
        )}
      </div>
    </div>
  );
};

export default ChallengeEntryPage;