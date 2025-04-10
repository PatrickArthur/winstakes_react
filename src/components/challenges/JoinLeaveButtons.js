// src/components/challenges/JoinLeaveButtons.js

import React from "react";

const JoinLeaveButtons = ({ api_url, isOwner, isParticipant, participantId, challengeId, profileId, token, setIsParticipant, fetchChallenge }) => {
  const joinChallenge = async () => {
    const confirmed = window.confirm("Joining this challenge will deduct tokens and is non-refundable. Continue?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${api_url}/challenges/${challengeId}/challenge_participants/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_id: profileId, challenge_id: challengeId }),
      });

      if (res.ok) {
        setIsParticipant(true);
        await fetchChallenge();
        alert("Joined successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const leaveChallenge = async () => {
    const confirmed = window.confirm("You will not be refunded. Continue?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${api_url}/challenges/${challengeId}/challenge_participants/unjoin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participant_id: participantId }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsParticipant(false);
        alert(data.message);
      } else {
        alert(data.error || "Unable to leave.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isOwner) return null;

  return isParticipant ? (
    <button className="btn btn-danger" onClick={leaveChallenge} style={{ marginBottom: '20px' }}>
      Leave Challenge
    </button>
  ) : (
    <button className="btn btn-primary" onClick={joinChallenge} style={{ marginBottom: '20px' }}>
      Join Challenge
    </button>
  );
};

export default JoinLeaveButtons;