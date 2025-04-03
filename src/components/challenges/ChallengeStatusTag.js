import React from 'react';

const ChallengeStatusTag = ({ status }) => {
  const statusColor = {
    upcoming: 'gray',
    open: 'green',
    voting: 'orange',
    closed: 'red',
  }[status];

  return (
    <span style={{ color: statusColor, fontWeight: 'bold' }}>
      {status.toUpperCase()}
    </span>
  );
};

export default ChallengeStatusTag;