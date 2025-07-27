import React, { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/api/events");
        setEvents(data);
      } catch (err) {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="button-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Amazing <span className="gradient-text">Events</span>
          </h1>
          <p className="hero-subtitle">
            Join memorable experiences and create lasting connections in your community.
          </p>
        </div>
      </div>

      <div className="events-section">
        <div className="section-header">
          <h2>Featured Events</h2>
          <p>Explore the latest and most exciting events happening around you.</p>
        </div>
        
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No Events Yet</h3>
              <p>Be the first to create an amazing event for the community!</p>
              <a href="/create-event" className="button-primary">
                Create Your First Event
              </a>
            </div>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
