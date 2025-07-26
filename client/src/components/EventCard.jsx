import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "./EventCard.css";

const EventCard = ({ event }) => {
  return (
    // Wrap the card in a Link component
    <Link to={`/event/${event._id}`} className="event-card">
      <img src={event.imageUrl} alt={event.title} />
      <div className="card-overlay">
        <h3>{event.title}</h3>
        <p>{event.date}</p>
      </div>
    </Link>
  );
};

export default EventCard;
