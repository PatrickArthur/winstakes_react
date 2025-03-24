import React, { useState, useEffect } from 'react';
import consumer from '../../consumer';
import { Link } from 'react-router-dom';
import './challenges.css'; // Your CSS file

const ChallengeList = ({token, joinedChallenges, createdChallenges}) => {
  const [challenges, setChallenges] = useState([]);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges?user_challenges=${joinedChallenges}&created_challenges=${createdChallenges}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Handle HTTP errors
          console.error('HTTP error', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setChallenges(data.challenges);
      } catch (error) {
        console.error('Error fetching challenges', error);
      }
    };

    fetchChallenges();

    const subscription = consumer.subscriptions.create('ChallengesChannel', {
      received(data) {
        if (data.type === 'JOIN') {
          // Handle a user joining the challenge, e.g. update user count
          console.log(`User ${data.user_id} joined challenge ${data.challenge_id}`);
        }
      }
    });

    return () => {
      if (subscription) {
        consumer.subscriptions.remove(subscription);
      }
    };
  }, [joinedChallenges, createdChallenges]);
  
  if (!Array.isArray(challenges) || challenges.length === 0) {
    return <p>No challenges available.</p>;
  }

  const sortedChallenges = [...challenges].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="challenges-container">
      <h1>Challenges</h1>
      <ul className="challenges-list">
        {sortedChallenges.map((challenge) => (
          <li className="challenge-item" key={challenge.id}>
            <Link to={`/challenges/${challenge.id}`}>
              <h2>{challenge.title}</h2>
              <p>Duration: {challenge.duration} days</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeList;