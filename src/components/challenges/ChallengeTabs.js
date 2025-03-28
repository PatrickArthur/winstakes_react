// src/components/challenges/ChallengeTabs.js

import React, { useState } from "react";
import ChallengeEntries from '../entries/ChallengeEntries';
import ChallengeParticipants from "./ChallengeParticipants";
import WonkView from '../wonks/WonkView';
import './ChallengeTabs.css'; // Your CSS file

const ChallengeTabs = ({ token, challenge, profileId, wonks, setWonks, newWonkContent, setNewWonkContent, hasMore }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="tab-container">
      <div className="tab-header">
        <button
          className={activeTab === "entries" ? "active" : ""}
          onClick={() => setActiveTab("entries")}
        >
          Entries
        </button>
        <button
          className={activeTab === "participants" ? "active" : ""}
          onClick={() => setActiveTab("participants")}
        >
          Participants
        </button>
        <button
          className={activeTab === "discussion" ? "active" : ""}
          onClick={() => setActiveTab("discussion")}
        >
          Discussion
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "entries" && (
          <ChallengeEntries
            token={token}
            challenge={challenge}
            profileId={profileId}
            creatorId={challenge.creator_id}
          />
        )}

        {activeTab === "participants" && (
          <ChallengeParticipants
            token={token}
            challenge={challenge}
            creatorId={challenge.creator_id}
            profileId={profileId}
          />
        )}

        {activeTab === "discussion" && (
          <WonkView
            wonks={wonks}
            profileId={profileId}
            setWonks={setWonks}
            newWonkContent={newWonkContent}
            setNewWonkContent={setNewWonkContent}
            challengeId={null}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  );
};

export default ChallengeTabs;