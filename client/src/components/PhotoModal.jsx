import React, { useState, useEffect } from "react";
import axios from "axios";

const PhotoModal = ({ photo, onClose, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/comments/photo/${photo._id}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    fetchComments();
  }, [photo._id]);

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="modal-image-container">
          <img src={photo.imageUrl} alt={photo.caption} />
        </div>
        <div className="modal-sidebar">
          <div className="comment-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <img
                  src={comment.user.avatarUrl}
                  alt={comment.user.name}
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <strong>{comment.user.name}</strong>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          {currentUser && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit">Post</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
