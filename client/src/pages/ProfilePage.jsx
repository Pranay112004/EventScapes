import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

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

      alert("Profile updated successfully!");
      window.location.reload(); // Simple way to refresh data
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Profile update failed.");
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
        <h2>My Uploaded Photos</h2>
        <div className="gallery-grid">
          {/* ... your existing photo gallery code ... */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
