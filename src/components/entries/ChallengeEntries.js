import React, { useEffect, useState } from 'react';
import consumer from '../../consumer';
import './entries.css';
import { Link, useNavigate } from 'react-router-dom';
import { isVotingOpen, canUserVote } from "../voting/votingHelpers";
import VoteButton from "../voting/VoteButton";
import { fetchProfile } from '../../services/profileService';

const ChallengeEntries = ({token, challenge, profileId, creatorId}) => {
    const challengeId = challenge.id;
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:4000';
    const [participant, setParticipant] = useState(false);
    const [isFollowerOfCreator, setIsFollowerOfCreator] = useState(false);
    const [entries, setEntries] = useState(Object.values(challenge.entries || []));
    const [votedEntryIds, setVotedEntryIds] = useState(new Set());
    const [subTab, setSubTab] = useState('unvoted');
    const navigate = useNavigate();

    const handleRowClick = (challengeId, participantId, entryId) => {
      navigate(`/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`);
    };

    useEffect(() => {
      const fetchUserProfile = async () => {
        await fetchProfile(API_URL, creatorId, token, setIsFollowerOfCreator);
        setLoading(false);
      }
      fetchUserProfile();
    }, [token]);

    const handleVoteUpdate = (entryId) => {
      setVotedEntryIds(prev => new Set(prev).add(entryId));
    };

    const displayedEntries = entries.filter(entry => {
      // Check if the entry is considered voted, either through `voted_by_current_user` or updated vote set
      const isVoted = entry.voted_by_current_user || votedEntryIds.has(entry.id);
      return subTab === 'voted' ? isVoted : !isVoted;
    });

    return (
      <div>
        <div className="entry-subtabs">
          <button className={subTab === 'unvoted' ? 'active' : ''} onClick={() => setSubTab('unvoted')}>Unvoted</button>
          <button className={subTab === 'voted' ? 'active' : ''} onClick={() => setSubTab('voted')}>Voted</button>
        </div>

        {displayedEntries.length === 0 ? (
          <p>No {subTab} entries.</p>
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
              {displayedEntries.map((participant, index) => (
                <tr key={index}
                    onClick={() => handleRowClick(participant.challenge_participant.challenge_id, participant.challenge_participant.id, participant.id)}
                    style={{ cursor: 'pointer' }}
                >
                  <td>{participant.challenge_participant.profile_name}</td>
                  <td>{participant.challenge_participant.user_email}</td>
                  <td>{new Date(participant.created_at).toLocaleDateString()}</td>
                  <td>
                    {participant.file_attachment ? (
                      <img src={participant.file_attachment} alt="File" className="attachment-thumbnail" />
                    ) : 'N/A'}
                  </td>
                  <td>
                    {participant.video_attachment ? (
                      <video controls style={{ width: '100px' }}>
                        <source src={participant.video_attachment} type="video/mp4" />
                      </video>
                    ) : 'N/A'}
                  </td>
                  <td>
                    {participant.evidence_attachment_urls?.length ? (
                      participant.evidence_attachment_urls.map((url, i) => (
                        <img key={i} src={url} alt={`Evidence ${i + 1}`} style={{ width: '50px', marginRight: '5px' }} />
                      ))
                    ) : 'N/A'}
                  </td>
                  <td>{participant.vote_count}</td>
                  <td>{participant.weighted_score}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {isVotingOpen(challenge) && canUserVote(challenge, !!participant, isFollowerOfCreator) && (
                      <VoteButton
                        api_url={API_URL}
                        token={token}
                        entryId={participant.id}
                        challengeId={challengeId}
                        profileId={profileId}
                        onVoteUpdate={handleVoteUpdate}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
};

export default ChallengeEntries;