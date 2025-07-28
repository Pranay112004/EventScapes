import React, { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";
import GroupCard from "../components/GroupCard";
import CreateGroupForm from "../components/CreateGroupForm";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsResponse = await axios.get("/api/events");
        setEvents(eventsResponse.data);
        
        // Fetch groups
        const headers = token ? { "x-auth-token": token } : {};
        const groupsResponse = await axios.get("/api/groups", { headers });
        setGroups(groupsResponse.data);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);
  
  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
  };
  
  const handleCancelCreate = () => {
    setShowCreateGroup(false);
  };

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

      {/* Groups Section */}
      <div className="groups-section">
        <div className="section-header">
          <h2>Community Groups</h2>
          <p>Join groups to share photos, videos and connect with like-minded people.</p>
          {token && (
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="button-primary create-group-btn"
            >
              Create Group
            </button>
          )}
        </div>
        
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No Groups Yet</h3>
              <p>Create the first community group and start sharing memories!</p>
              {token ? (
                <button 
                  onClick={() => setShowCreateGroup(true)}
                  className="button-primary"
                >
                  Create Your First Group
                </button>
              ) : (
                <a href="/login" className="button-primary">
                  Login to Create Groups
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
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
      
      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupForm
          onGroupCreated={handleGroupCreated}
          onCancel={handleCancelCreate}
        />
      )}
    </div>
  );
};

export default HomePage;
