import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PhotoUploadForm from "../components/PhotoUploadForm";
import { jwtDecode } from "jwt-decode";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // This useEffect now safely gets the current user's data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken.user);
      } catch (err) {
        // If token is invalid, remove it and log the error
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      setLoading(true);
      try {
        const eventRes = await axios.get(`/api/events/${id}`);
        setEvent(eventRes.data);
        const photosRes = await axios.get(`/api/photos/event/${id}`);
        setPhotos(photosRes.data);
      } catch (err) {
        setError("Could not load event details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndPhotos();
  }, [id]);

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([newPhoto, ...photos]);
  };

  const handleDelete = async (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/photos/${photoId}`, {
          headers: { "x-auth-token": token },
        });
        setPhotos(photos.filter((p) => p._id !== photoId));
      } catch (err) {
        alert("Could not delete photo.");
      }
    }
  };

  // (Your handleDeleteEvent function would go here if you add it)

  if (loading) return <p>Loading event...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!event) return <p>Event not found.</p>;

  const isOwner = currentUser && currentUser.id === event.owner;

  return (
    <div className="event-detail-container">
      {isOwner && (
        <div className="owner-actions">
          <Link to={`/event/${event._id}/edit`} className="button-edit">
            Edit Event
          </Link>
        </div>
      )}

      <h1>{event.title}</h1>
      <p className="event-date">{event.date}</p>
      <img
        src={event.imageUrl}
        alt={event.title}
        className="event-detail-image"
      />

      {/* This conditional check will now work correctly */}
      {currentUser && (
        <PhotoUploadForm
          eventId={event._id}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}

      <div className="photo-gallery">
        <h2>Event Gallery</h2>
        <div className="gallery-grid">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo._id} className="photo-item">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Event photo"}
                />
                <div className="photo-overlay">
                  {photo.caption && <p className="caption">{photo.caption}</p>}
                  {photo.user && (
                    <p className="uploader-name">by {photo.user.name}</p>
                  )}
                </div>
                {currentUser &&
                  photo.user &&
                  currentUser.id === photo.user._id && (
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="delete-btn"
                    >
                      &times;
                    </button>
                  )}
              </div>
            ))
          ) : (
            <p>No photos have been uploaded to this event yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
