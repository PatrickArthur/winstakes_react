// src/components/voting/VoteButton.js

import React, { useEffect, useState } from 'react';
import './Voting.css';

const VoteButton = ({api_url, token, entryId, challengeId, profileId}) => {
  const [hasVoted, setHasVoted] = useState(false);

   useEffect(() => {
    // Function to check voting status
    const checkVoteStatus = async () => {
      try {
        // Make an API call to check if the user has voted
        const response = await fetch(`/check_vote?profile_id=${profileId}&entry_id=${entryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the header
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.voted) {
            setHasVoted(true);
          }
        } else {
          console.error('Failed to check vote status:', response.statusText);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };

    checkVoteStatus();
  }, [profileId, entryId, token]);

  const handleVote = async (event) => {
    event.stopPropagation();
    event.preventDefault(); 
    try {
     const res = await fetch(`${api_url}/challenges/${challengeId}/entries/${entryId}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });


      const data = await res.json();
      if (res.ok) {
        setHasVoted(true)
        alert("Vote submitted!");
      } else {
        alert(data.error || "Voting failed");
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <button
      onClick={handleVote}
      className={`btn-vote ${hasVoted ? 'voted' : ''}`}
      disabled={hasVoted}
    >
      {hasVoted ? 'Voted' : 'Vote'}
    </button>
  );
};

export default VoteButton;