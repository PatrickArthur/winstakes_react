import React, { useEffect, useState } from 'react';
import consumer from '../../consumer';
import moment from 'moment';
import { Link } from 'react-router-dom'
import { FaCommentDots } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaComment } from 'react-icons/fa';

const Comment = ({ token, wonkId, profileId, commentId}) => {
  const [wonk, setWonk] = useState(null);
  const [comment, setComment] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route

  const fetchComment = async () => {
      try {
        const response = await fetch(`${API_URL}/wonks/${wonkId}/comments/${commentId}`, {
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

        setComment(data.comment);
        setComments(data.comment.replies)
      } catch (error) {
        console.error('Error fetching comments', error);
      }
    };

  useEffect(() => {
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

    fetchWonkDetails();
    fetchComment();

    // Subscribe to the comments channel
    const subscription = consumer.subscriptions.create(
      { channel: 'CommentsChannel', wonk_id: wonkId },
      {
        received: (data) => {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

          if (parsedData.action === "delete") {
            const idToRemove = parsedData.id;
            setComments((prevComments) => 
              prevComments.filter((comment) => comment.id !== idToRemove)
            );
          } else if (parsedData.action === "new_reply") {
            const { commentId, reply } = parsedData;
            setComments((prevComments) =>
              prevComments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, replies: [...comment.replies, reply] }
                  : comment
              )
            );
          } else {
            // Assuming incoming data with an "add" action includes a new comment.
            setComments((prevComments) => [...prevComments, parsedData]);
          }
        },
      }
    );

    return () => {
      if (subscription) {
        consumer.subscriptions.remove(subscription);
      }
    };
  }, [wonkId, commentId]);

  const renderReplies = (replies) => {
    return replies.map(reply => (
      <div key={reply.id} style={{ marginLeft: '20px'}}>





        <Link to={`/wonks/${wonkId}/comments/${reply.id}`}>
          {reply.content}
        </Link>
        <span>{reply.replies_count} replies</span>

        {reply.replies && renderReplies(reply.replies)}
      </div>
    ));
  };

  const renderComments = (comments) => {
    return comments.map(comment => {
      // Conditional rendering: only render comments where parent_id is null
      if (comment.parent_comment_id === null) {
        return (
          <div key={comment.id} className="comment">
            <p className="comment-content">{comment.content}</p>
            {/* Additional comment details can be rendered here */}
          </div>
        );
      } 
      // If parent_id is not null, do not render anything or return null
      return null;
    });
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

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async (commId, profId) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/wonks/${wonkId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newComment, wonk_id: wonkId, profile_id: profId, parent_comment_id: commId }),
        });

      if (response.ok) {
        setNewComment(''); // Clear the comment field after submission
       
      }
    } catch (error) {
      console.error('Error submitting comment', error);
    }
  };

  if (!wonk) {
    return <div>Loading...</div>;
  }

  if (!comment) {
    return <div>Loading...</div>;
  }

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
        
        <p className="comment-content">{renderComments(comments)}</p>

        <Link to={`/wonks/${comment.wonk.id}/comments/${comment.id}`}
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
        <FaComment style={{ marginRight: '5px' }} />
          <span>{comment.replies_count} replies</span>
        </Link>

        {sortedComments.length > 0 ? (
          <ul className="comment-list">
            {sortedComments.map((comment) => (
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
                <p className="comment-content">{renderComments(comments)}</p>
                <div>{renderReplies(comments)}</div>
                
                <Link to={`/wonks/${comment.wonk.id}/comments/${comment.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                 <FaComment style={{ marginRight: '5px' }} />
                  <span>{comment.replies_count} replies</span>
                </Link>
              </li>
            ))}
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
          <button onClick={() => handleCommentSubmit(comment.id, comment.profile.id)} className="submit-button">
            Submit
          </button>
        </div>
      </section>
    </div>
  );
};

export default Comment;