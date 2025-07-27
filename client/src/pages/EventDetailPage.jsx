import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PhotoUploadForm from "../components/PhotoUploadForm";
import { jwtDecode } from "jwt-decode";
import PhotoModal from "../components/PhotoModal";
import toast from "react-hot-toast";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken.user);
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const [eventRes, photosRes] = await Promise.all([
          axios.get(`/api/events/${id}`),
          axios.get(`/api/photos/event/${id}`)
        ]);
        
        setEvent(eventRes.data);
        setPhotos(photosRes.data);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event details');
        if (err.response?.status === 404) {
          toast.error('Event not found');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, navigate]);

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
    toast.success('Photo uploaded successfully!');
  };

  const handleDeletePhoto = async (photoId) => {
    const token = localStorage.getItem('token');
    if (!token || !window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await axios.delete(`/api/photos/${photoId}`, {
        headers: { 'x-auth-token': token }
      });
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
      toast.success('Photo deleted successfully');
      setSelectedPhoto(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Failed to delete photo');
    }
  };

  const handleDeleteEvent = async () => {
    const token = localStorage.getItem('token');
    if (!token || !window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/events/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Event deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Event Not Found</h3>
          <p>{error || 'The event you are looking for does not exist.'}</p>
          <Link to="/" className="button-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && event.owner === currentUser.id;

  return (
    <div className="event-detail-page">
      <div className="event-header">
        <div className="event-image-container">
          <img 
            src={event.imageUrl || '/api/placeholder/800/400'} 
            alt={event.title}
            className="event-hero-image"
          />
          <div className="event-overlay">
            <div className="event-info">
              <h1 className="event-title">{event.title}</h1>
              <p className="event-date">{formatDate(event.date)}</p>
              {event.location && <p className="event-location">📍 {event.location}</p>}
            </div>
            {isOwner && (
              <div className="event-actions">
                <Link 
                  to={`/event/${id}/edit`} 
                  className="button-primary"
                >
                  Edit Event
                </Link>
                <button 
                  onClick={handleDeleteEvent}
                  className="button-danger"
                >
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {event.description && (
        <div className="event-description">
          <div className="form-container">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>
        </div>
      )}

      {currentUser && (
        <PhotoUploadForm
          eventId={event._id}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}

      <div className="photo-gallery">
        <div className="section-header">
          <h2>Event Gallery</h2>
          <p>Share your memories from this amazing event</p>
        </div>
        
        {photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No Photos Yet</h3>
              <p>Be the first to share a moment from this event!</p>
              {!currentUser && (
                <Link to="/login" className="button-primary">
                  Login to Upload Photos
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="photo-item"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.mediaType === 'video' ? (
                  <video 
                    src={photo.imageUrl} 
                    className="gallery-media"
                    muted
                  />
                ) : (
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.caption || "Event photo"} 
                    className="gallery-media"
                    loading="lazy"
                  />
                )}
                <div className="photo-overlay">
                  <div className="photo-info">
                    <p className="photo-user">📸 {photo.user?.name || 'Anonymous'}</p>
                    {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                  </div>
                  {currentUser && currentUser.id === photo.user?._id && (
                    <button 
                      className="delete-photo-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo._id);
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          currentUser={currentUser}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
