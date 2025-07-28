import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import MultiFileUpload from "../components/MultiFileUpload";

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUploadMedia, setShowUploadMedia] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaComments, setMediaComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const currentUserId = localStorage.getItem("token") ? 
    JSON.parse(atob(localStorage.getItem("token").split('.')[1])).user.id : null;

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupMedia();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : {};
      
      const { data } = await axios.get(`/api/groups/${id}`, { headers });
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group:", error);
      setError(error.response?.data?.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMedia = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : {};
      
      const { data } = await axios.get(`/api/groups/${id}/media`, { headers });
      setMedia(data);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error("Please enter a username");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/api/groups/${id}/members`,
        { username: newMemberName },
        { headers: { "x-auth-token": token } }
      );
      
      setGroup(data);
      setNewMemberName("");
      setShowAddMember(false);
      toast.success("Member added successfully!");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(
        `/api/groups/${id}/members/${userId}`,
        { headers: { "x-auth-token": token } }
      );
      
      setGroup(data);
      toast.success("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUploadMedia = async (files, captions) => {
    console.log("🚀 Upload started with files:", files);
    console.log("🚀 Upload captions received:", captions);
    
    if (!files || files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);
      
      const formData = new FormData();
      
      // Append each file
      files.forEach((file, index) => {
        console.log(`📁 Adding file ${index + 1}:`, file.name, file.type, file.size);
        formData.append("media", file);
      });
      
      // Append captions as JSON string
      const captionsArray = files.map((_, index) => captions[index] || "");
      console.log("📝 Captions array:", captionsArray);
      formData.append("captions", JSON.stringify(captionsArray));

      console.log("📤 Sending request to:", `/api/groups/${id}/media`);
      const response = await axios.post(`/api/groups/${id}/media`, formData, {
        headers: { 
          "x-auth-token": token,
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("✅ Upload successful, response:", response.data);
      fetchGroupMedia();
      setShowUploadMedia(false);
      toast.success(`${files.length} file${files.length !== 1 ? 's' : ''} uploaded successfully!`);
    } catch (error) {
      console.error("❌ Error uploading media:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadMedia(false);
  };

  const handleDownloadMedia = async (mediaItem) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to download media");
        return;
      }

      console.log("📥 Starting download for media:", mediaItem._id);
      toast.loading("Preparing download...");

      // Fetch the media file with authentication
      const response = await axios.get(`/api/groups/media/${mediaItem._id}/download`, {
        headers: { "x-auth-token": token },
        responseType: 'blob' // Important for file downloads
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Extract file extension from media URL or use default
      const fileExtension = mediaItem.mediaUrl.split('.').pop().split('?')[0] || 
        (mediaItem.mediaType === 'video' ? 'mp4' : 'jpg');
      
      // Create filename with timestamp and user info
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${group.name}_${mediaItem.user.name}_${timestamp}.${fileExtension}`
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ Download completed:", filename);
      toast.dismiss();
      toast.success("Download completed!");
    } catch (error) {
      console.error("❌ Error downloading media:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to download media");
    }
  };

  const fetchMediaComments = async (mediaId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : {};
      
      const { data } = await axios.get(`/api/groups/media/${mediaId}/comments`, { headers });
      setMediaComments(prev => ({ ...prev, [mediaId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (mediaId) => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/api/groups/media/${mediaId}/comments`,
        { text: newComment },
        { headers: { "x-auth-token": token } }
      );
      
      setMediaComments(prev => ({
        ...prev,
        [mediaId]: [data, ...(prev[mediaId] || [])]
      }));
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    fetchMediaComments(mediaItem._id);
  };

  const isAdmin = group && currentUserId === group.admin._id.toString();
  const isMember = group && group.members.some(member => member.user._id.toString() === currentUserId);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading group details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Group</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="button-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Group Not Found</h3>
          <p>The group you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="button-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-detail-page">
      {/* Group Header */}
      <div className="group-header">
        <div className="group-cover">
          <img src={group.coverImage} alt={group.name} />
          {group.isPrivate && (
            <div className="private-indicator">
              🔒 Private Group
            </div>
          )}
        </div>
        
        <div className="group-info">
          <h1>{group.name}</h1>
          <p className="group-description">
            {group.description || "No description available"}
          </p>
          
          <div className="group-meta">
            <div className="admin-info">
              <img src={group.admin.avatarUrl} alt={group.admin.name} />
              <span>Admin: {group.admin.name}</span>
            </div>
            <div className="member-count">
              👥 {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Action Buttons */}
          {(isMember || isAdmin) && (
            <div className="group-actions">
              {isAdmin && (
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="button-secondary"
                >
                  Add Member
                </button>
              )}
              
              {(isMember || isAdmin) && (
                <button 
                  onClick={() => setShowUploadMedia(true)}
                  className="button-primary"
                >
                  Upload Photos/Videos
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="group-section">
        <h2>Members ({group.members.length})</h2>
        <div className="members-grid">
          {group.members.map((member) => (
            <div key={member.user._id} className="member-card">
              <img src={member.user.avatarUrl} alt={member.user.name} />
              <div className="member-info">
                <h4>{member.user.name}</h4>
                <span className="join-date">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
              {isAdmin && member.user._id !== group.admin._id && (
                <button
                  onClick={() => handleRemoveMember(member.user._id)}
                  className="remove-member-btn"
                  title="Remove member"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="group-section">
        <h2>Photos & Videos ({media.length})</h2>
        {media.length === 0 ? (
          <div className="empty-media">
            <p>No photos or videos yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="media-gallery">
            {media.map((item) => (
              <div key={item._id} className="media-item" onClick={() => handleMediaClick(item)}>
                {item.mediaType === "video" ? (
                  <video src={item.mediaUrl} onClick={(e) => e.stopPropagation()} />
                ) : (
                  <img src={item.mediaUrl} alt={item.caption || "Group media"} />
                )}
                {item.caption && (
                  <div className="media-caption">
                    <p>{item.caption}</p>
                    <small>by {item.user.name}</small>
                  </div>
                )}
                <div className="media-actions">
                  <button 
                    className="comment-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMediaClick(item);
                    }}
                  >
                    💬 Comment
                  </button>
                  <button 
                    className="download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMedia(item);
                    }}
                    title="Download media"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Member</h3>
              <button onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter exact username"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddMember(false)}>
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {showUploadMedia && (
        <MultiFileUpload 
          onUpload={handleUploadMedia}
          onCancel={handleCancelUpload}
          uploading={uploading}
        />
      )}

      {/* Media Detail Modal with Comments */}
      {selectedMedia && (
        <div className="modal-overlay" onClick={() => setSelectedMedia(null)}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-header">
              <h3>Media by {selectedMedia.user.name}</h3>
              <button onClick={() => setSelectedMedia(null)}>✕</button>
            </div>
            
            <div className="media-modal-content">
              <div className="media-display">
                {selectedMedia.mediaType === "video" ? (
                  <video src={selectedMedia.mediaUrl} controls />
                ) : (
                  <img src={selectedMedia.mediaUrl} alt={selectedMedia.caption} />
                )}
                {selectedMedia.caption && (
                  <div className="media-modal-caption">
                    <p>{selectedMedia.caption}</p>
                  </div>
                )}
              </div>
              
              <div className="comments-section">
                <h4>Comments</h4>
                
                <div className="comments-list">
                  {mediaComments[selectedMedia._id]?.length > 0 ? (
                    mediaComments[selectedMedia._id].map((comment) => (
                      <div key={comment._id} className="comment-item">
                        <img 
                          src={comment.user.avatarUrl} 
                          alt={comment.user.name}
                          className="comment-avatar"
                        />
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">{comment.user.name}</span>
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  )}
                </div>
                
                {(isMember || isAdmin) && (
                  <div className="comment-form">
                    <div className="comment-input-wrapper">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="comment-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(selectedMedia._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(selectedMedia._id)}
                        disabled={commentLoading || !newComment.trim()}
                        className="comment-submit"
                      >
                        {commentLoading ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
