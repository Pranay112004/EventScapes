import React from "react";
import { Link } from "react-router-dom";
import "./EventCard.css";

const EventCard = ({ event }) => {
  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/event/${event._id}`} className="event-card fade-in">
      <div className="event-card-image">
        <img 
          src={event.imageUrl || '/api/placeholder/320/180'} 
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="card-overlay">
        <h3>{event.title}</h3>
        <div className="event-meta">
          <p className="event-date">{formatDate(event.date)}</p>
          {event.location && <p className="event-location">{event.location}</p>}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
