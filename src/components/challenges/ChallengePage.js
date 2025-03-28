import React, { useEffect, useState } from 'react';
import consumer from '../../consumer';
import './challenges.css'; // Your CSS file
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faGavel } from '@fortawesome/free-solid-svg-icons';
import { FaComment } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';
import { fetchWonks, wonkSubscription, CurrentUserProfile, useInfiniteScroll } from '../../services/wonkService';
import LikeButton from '../likes/LikeButton';
import ChallengeTabs from './ChallengeTabs';

const ChallengePage = ({token, challengeId, profileId}) => {
    const [challenge, setChallenge] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [participant, setParticipant] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [wonks, setWonks] = useState([]);
    const [newWonkContent, setNewWonkContent] = useState('');
    const [hasMore, setHasMore] = useState(true); // To check if more data is available
    const [page, setPage] = useState(1);
    const storedProfileId = localStorage.getItem('profile_id');

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
          setParticipant(data.challenge.challenge_participants.filter(challenge => challenge.profile_id == profileId && challenge.challenge_id == challengeId)[0])
          setIsParticipant(data.challenge.challenge_participants.some(challenge => challenge.profile_id == profileId))
          setParticipants(data.challenge.challenge_participants.filter(challenge => challenge.profile_id != profileId))
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchChallenge();


      const subscription = consumer.subscriptions.create(
        { channel: 'ChallengesChannel', challenge_id: challengeId },
        {
          received(data) {
            setChallenge(data.challenge);
          },
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }, [challengeId, token]);

    const handleEdit = () => {
      navigate(`/edit/challenges/${challengeId}`);
    };

    const handleDeleteChallenge = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to delete challenge');

        // Handle successful deletion (e.g., redirect or display a message)
        navigate(`/challenges`); 
        alert('Challenge deleted successfully.');
      } catch (err) {
        setError(err.message);
      }
    };

    const handleJoin = async () => {
       try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Assuming the user token is available for auth
          },
          body: JSON.stringify({ profile_id: profileId, challenge_id: challengeId }), // Payload if needed
        });

        if (!response.ok) {
          // Handle response errors
          throw new Error('Failed to join challenge');
        }

        const result = await response.json();
        setIsParticipant(true)
        console.log('Joined successfully:', result);
      } catch (error) {
        console.error('Error joining challenge:', error);
        // Optionally, show error message to the user
      }
    };

    const handleUnjoin = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges/${challengeId}/challenge_participants/unjoin`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,  // Ensure you have the token for authentication
          },
          body: JSON.stringify({ participant_id: participant.id }),  // Ensure the correct ID is passed
        });

        if (response.ok) {
          console.log("Unjoined successfully.");
          setIsParticipant(false);  // Update state to reflect that the user is no longer a participant
        } else {
          const errorData = await response.json();
          console.error(errorData.error || "Unable to unjoin.");
          // Optionally, handle the error by displaying a message to the user
        }
      } catch (error) {
        console.error("Network error: ", error);
        // Optionally, handle the network error
      }
    };

    const loadMoreWonks = () => {
      setPage((prevPage) => prevPage + 1);
    };

    useInfiniteScroll(loadMoreWonks, hasMore);

    if (loading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    if (!challenge) {
      return <p>No challenge data available.</p>;
    }

    const isOwner = challenge.creator.profile_id == profileId;
    const sortedParticipants = [...participants].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const likedRecord = challenge.likes.find((like) => like.profile_id === storedProfileId);
    const likeId = likedRecord ? likedRecord.id : null;
    const initialLiked = challenge.likes.some(like => like.profile_id == storedProfileId)

    return (
      <div className="challenge-show-page">
        <h1>{challenge.title}</h1>
        <LikeButton
            api_url={API_URL}
            token={token}
            resourceType="challenge"
            resourceId={challenge.id}
            commentId={null}
            initialLiked={initialLiked}
            initialCount={challenge.likes.length}
            likeId={likeId}
        />
        <p>Duration: {challenge.duration} days</p>
        <p>{challenge.description}</p>

        {challenge.video_url ? (
          <div>
            <video width="520" height="280" controls>
              <source src={challenge.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <br />
          </div>
        ) : null}

        {isOwner && (
          <div>
            <div className="button-group">
              <button className="button edit" onClick={handleEdit} style={{ marginBottom: '20px' }}>
                <i className="fa-solid fa-pencil-alt button-icon"></i>Edit Challenge
              </button>
              <button className="button delete" onClick={handleDeleteChallenge} style={{ marginBottom: '20px' }}>
                <i className="fa-solid fa-trash button-icon"></i>Delete Challenge
              </button>
            </div>
          </div>
        )}
        {!isOwner && !isParticipant ? (
          <button className="button join" onClick={handleJoin} style={{ marginBottom: '20px' }}>
            Join Challenge
          </button>
        ) : isParticipant ? (
          <>
            <button className="btn btn-danger" onClick={handleUnjoin} style={{ marginBottom: '20px' }}>
              Leave Challenge
            </button>
          </>
        ) : null}
        <ChallengeTabs
          token={token}
          challenge={challenge}
          profileId={profileId}
          wonks={wonks}
          setWonks={setWonks}
          newWonkContent={newWonkContent}
          setNewWonkContent={setNewWonkContent}
          hasMore={hasMore}
        />
    </div>
    );

};

export default ChallengePage;