import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // State for the edit form
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { "x-auth-token": token } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/users/me", config);
        setUser(userRes.data);
        setName(userRes.data.name);

        const photosRes = await axios.get("/api/photos/user/me", config);
        setPhotos(photosRes.data);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const toastId = toast.loading("Updating profile...");
    
    try {
      // Update name
      const nameRes = await axios.put("/api/users/me", { name }, config);

      // Update avatar if a new one was selected
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);
        await axios.post("/api/users/avatar", formData, {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Profile updated successfully!", { id: toastId });
      setEditMode(false);
      // Refresh user data
      const userRes = await axios.get("/api/users/me", config);
      setUser(userRes.data);
      setName(userRes.data.name);
      setAvatar(null);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Profile update failed. Please try again.", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>Could not load profile.</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.avatarUrl} alt={user.name} className="profile-avatar" />
        <div className="profile-info">
          <h1>{user.name}'s Profile</h1>
          <p>Email: {user.email}</p>
          <button
            onClick={() => setEditMode(!editMode)}
            className="button-edit"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="form-container">
          <h2>Update Your Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>New Profile Picture</label>
            <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}

      <div className="photo-gallery">
        <div className="section-header">
          <h2>My Uploaded Media ({photos.length})</h2>
          <p>All the photos and videos you've shared across events</p>
        </div>
        
        {photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No Media Yet</h3>
              <p>Start sharing your memories by uploading photos to events!</p>
            </div>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div key={photo._id} className="photo-item">
                {photo.mediaType === 'video' ? (
                  <video 
                    src={photo.imageUrl} 
                    className="gallery-media"
                    controls
                    muted
                  />
                ) : (
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.caption || 'User photo'}
                    className="gallery-media"
                    loading="lazy"
                  />
                )}
                <div className="photo-overlay">
                  <div className="photo-info">
                    {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                    <p className="photo-date">{new Date(photo.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
