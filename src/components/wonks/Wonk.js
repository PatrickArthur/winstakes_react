import React, { useState, useEffect, useCallback } from 'react';
import consumer from '../../consumer';
import './Wonk.css';
import moment from 'moment';
import { Link } from 'react-router-dom'
import { FaCommentDots } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaComment } from 'react-icons/fa';
import LikeButton from '../likes/LikeButton';

const Wonk = ({ token , wonkId, profileId}) => {
  const [wonk, setWonk] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const storedProfileId = localStorage.getItem('profile_id');

  useEffect(() => {
    // Fetch wonk details
    const fetchWonkDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/wonks/${wonkId}`, {
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
        setWonk(data.wonk);
      } catch (error) {
        console.error('Error fetching wonk details', error);
      }
    };

    // Fetch existing comments
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_URL}/wonks/${wonkId}/comments`, {
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
        setComments(data.comments);
      } catch (error) {
        console.error('Error fetching comments', error);
      }
    };

    fetchWonkDetails();
    fetchComments();

    // Subscribe to the comments channel
    const subscription = consumer.subscriptions.create(
      { channel: 'CommentsChannel', wonk_id: wonkId },
      {
        received: (comment) => {
          const parsedData = typeof comment === 'string' ? JSON.parse(comment) : comment;
          // Check the action type from the incoming data
          if (parsedData.action === "delete") {
            const idToRemove = parsedData.id;
              setComments((prevComments) => 
                prevComments.filter((comment) => comment.id !== idToRemove)
              );
            } else {
              setComments((prevComments) => [...prevComments, comment]);
            }
        },
      }
    );

    const wonkSubscription = consumer.subscriptions.create(
      { channel: 'WonkChannel', wonk_id: wonkId },
      {
        received: (updatedWonk) => {
          setWonk(updatedWonk)
        },
      }
    );

    return () => {
      if (subscription) {
        consumer.subscriptions.remove(subscription);
      }

      if (wonkSubscription) {
        consumer.subscriptions.remove(wonkSubscription);
      }
    };
  }, [wonkId]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/wonks/${wonkId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newComment, wonk_id: wonkId, profile_id: profileId}),
        });

      if (response.ok) {
        setNewComment(''); // Clear the comment field after submission
      }
    } catch (error) {
      console.error('Error submitting comment', error);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).fromNow();
  };

  const CurrentUserComment = (profileId) => {
    if (profileId == localStorage.getItem('profile_id')) {
      return true
    } else {
      return false
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setComments((prevComments) => 
        prevComments.filter((comment) => comment.id !== id)
      );
      
      // Alternatively, you can optimistically update the UI here
      // setWonks(wonks.filter(wonk => wonk.id !== id));
    } catch (error) {
      console.error('Error deleting wonk:', error);
    }
  };

  if (!wonk) {
    return <div>Loading...</div>;
  }
  console.log(comments[0])
  const renderComments = (comments) => {
    return comments.map(comment => {
      const likedRecord = comment.likes.find((like) => like.profile_id === storedProfileId);
      const likeId = likedRecord ? likedRecord.id : null;
      const initialLiked = comment.likes.some(like => like.profile_id == storedProfileId)
      // Conditional rendering: only render comments where parent_id is null
      if (comment.parent_comment_id === null) {
        return (
          <li key={comment.id} className="comment-item">
                <div className="comment-header">
                  <Link to={`/profile/${comment.profile.id}`}>
                    <img
                      src={`${API_URL}${comment.profile.photo_url}` || '/path/to/default/image.jpg'}
                      alt="Profile"
                      className="profile-pic"
                    />
                   </Link>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px', width: '100%' }}>
                    <div className="comment-details">
                      <div className="comment-info">
                        <p className="comment-author">{comment.profile.email}</p>
                        <p className="comment-date">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    {CurrentUserComment(comment.profile_id) && (
                        <FontAwesomeIcon 
                          icon={faTrash} 
                          onClick={() => handleDelete(comment.id)} 
                          style={{ cursor: 'pointer', color: 'red' }}
                          className="delete-icon"
                        />
                      )}
                  </div>
                </div>
                <p className="comment-content">{comment.content}</p>
                <div className="comment-details" style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                  <Link 
                    to={`/wonks/${comment.wonk.id}/comments/${comment.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      flexGrow: 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}> {/* Nested flex container for the icon and text */}
                      <FaComment style={{ marginRight: '5px' }} />
                      <span>{comment.replies_count} replies</span>
                    </div>
                  </Link>
                  <LikeButton
                      api_url={API_URL}
                      token={token}
                      resourceType="wonk"
                      resourceId={comment.wonk.id}
                      commentId={comment.id}
                      initialLiked={initialLiked}
                      initialCount={comment.likes.length}
                      likeId={likeId}
                  />
                </div>
          </li>
        );
      } 
      // If parent_id is not null, do not render anything or return null
      return null;
    });
  };

  const sortedComments = [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  console.log(sortedComments)

  return (
    <div className="wonk-container">
      <div className="wonk-info">
        <Link to={`/profile/${wonk.profile.id}`}>
          <img
            src={`${API_URL}${wonk.profile.photo_url}`} // Replace with default or actual image path
            alt="Profile"
            className="profile-pic"
          />
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <p style={{ margin: '0 10px' }}>by {wonk.profile.email}</p>
          <p style={{ margin: '0' }}>{formatDate(wonk.created_at)}</p>
        </div>
      </div>

      <p style={{ marginTop: '10px' }}>{wonk.content}</p>

      <section className="comment-section">
        <div className="comment-header">
          <FaCommentDots className="comment-icon" />
          <span className="comment-count">
            {wonk.comments_count}
          </span>
        </div>

        {sortedComments.length > 0 ? (
          <ul className="comment-list">
            {renderComments(sortedComments)}
          </ul>
        ) : (
          <p className="no-comments">No comments yet</p>
        )}

        <div className="comment-input-container">
          <textarea
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Add a comment..."
            className="textarea"
          />
          <button onClick={handleCommentSubmit} className="submit-button">
            Submit
          </button>
        </div>
      </section>
    </div>
  );
};

export default Wonk;