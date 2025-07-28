import React, { useState, useEffect } from "react";
import axios from "axios";

const PhotoModal = ({ photo, onClose, currentUser, onDelete }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/comments/photo/${photo._id}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [photo._id]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `/api/comments/photo/${photo._id}`,
        { text: newComment },
        { headers: { "x-auth-token": token } }
      );
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      await onDelete(photo._id);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="photo-modal-header">
          <div className="photo-info-header">
            <div className="photo-user-info">
              <div className="user-avatar">
                <span>📸</span>
              </div>
              <div className="user-details">
                <h3>{photo.user?.name || 'Anonymous'}</h3>
                <p className="upload-date">{formatDate(photo.createdAt)}</p>
              </div>
            </div>
            <div className="photo-actions">
              {currentUser && currentUser.id === photo.user?._id && (
                <button 
                  onClick={handleDelete}
                  className="delete-btn"
                  title="Delete photo"
                >
                  🗑️
                </button>
              )}
              <button 
                className="close-btn" 
                onClick={onClose}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="photo-modal-body">
          <div className="photo-display">
            {!imageLoaded && (
              <div className="photo-loading">
                <div className="loading-spinner"></div>
                <p>Loading photo...</p>
              </div>
            )}
            {photo.mediaType === 'video' ? (
              <video 
                src={photo.imageUrl}
                controls
                className="modal-video"
                onLoadedData={() => setImageLoaded(true)}
              />
            ) : (
              <img 
                src={photo.imageUrl} 
                alt={photo.caption || 'Event photo'}
                className="modal-image"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            )}
            {photo.caption && (
              <div className="photo-caption">
                <p>{photo.caption}</p>
              </div>
            )}
          </div>

          <div className="photo-comments">
            <div className="comments-header">
              <h4>Comments ({comments.length})</h4>
            </div>
            
            <div className="comments-list">
              {loading ? (
                <div className="comments-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-avatar">
                      <span>👤</span>
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong className="comment-author">{comment.user?.name || 'Anonymous'}</strong>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {currentUser ? (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <div className="comment-input-wrapper">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-input"
                  />
                  <button 
                    type="submit" 
                    className="comment-submit"
                    disabled={!newComment.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
            ) : (
              <div className="login-prompt">
                <p>Please log in to comment on this photo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
