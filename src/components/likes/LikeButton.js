import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

function LikeButton({ api_url, token, resourceType, resourceId, commentId = null, initialLiked, initialCount, likeId }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] =  useState(initialCount);

  const handleLikeClick = async () => {
    setLiked(!liked);
    setLikeCount((prevCount) => prevCount + (liked ? -1 : 1));

    let url;
    if (resourceType === 'wonk') {
      if (commentId) {
        // Assuming each like under a comment is uniquely identified by likeId
        url = liked 
          ? `${api_url}/wonks/${resourceId}/comments/${commentId}/likes/${likeId}`
          : `${api_url}/wonks/${resourceId}/comments/${commentId}/likes`;
      } else {
        // Same applies for likes directly under a wonk
        url = liked 
          ? `${api_url}/wonks/${resourceId}/likes/${likeId}` 
          : `${api_url}/wonks/${resourceId}/likes`;
      }
    } else if (resourceType === 'challenge') {
      url = liked 
        ? `${api_url}/challenges/${resourceId}/likes/${likeId}` 
        : `${api_url}/challenges/${resourceId}/likes`;
    } else {
      console.error("Invalid resource type");
      return;
    }

    const method = liked ? 'DELETE' : 'POST';
    debugger
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

    } catch (error) {
      console.error('Error updating like:', error);
      // Revert the state change
      setLiked(!liked);
      setLikeCount((prevCount) => prevCount - (liked ? -1 : 1));
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      style={{
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        color: liked ? '#FF0000' : '#444', // Red if liked, gray otherwise
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.3s ease',
      }}
    >
      <FaHeart />
      <span style={{ marginLeft: '5px' }}>{likeCount}</span>
    </button>
  );
}

export default LikeButton;