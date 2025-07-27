import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicProfilePage = () => {
  const { id } = useParams(); // Get user ID from the URL
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/users/${id}`);
        setUser(userRes.data);

        const photosRes = await axios.get(`/api/photos/user/${id}`);
        setPhotos(photosRes.data);
      } catch (err) {
        console.error("Failed to fetch public profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.avatarUrl} alt={user.name} className="profile-avatar" />
        <div className="profile-info">
          <h1>{user.name}'s Profile</h1>
        </div>
      </div>

      <div className="photo-gallery">
        <h2>{user.name}'s Uploaded Media</h2>
        <div className="gallery-grid">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo._id} className="photo-item">
                {photo.mediaType === "video" ? (
                  <video
                    src={photo.imageUrl}
                    controls
                    className="gallery-media"
                  />
                ) : (
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "User media"}
                    className="gallery-media"
                  />
                )}
              </div>
            ))
          ) : (
            <p>{user.name} hasn't uploaded any media yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
