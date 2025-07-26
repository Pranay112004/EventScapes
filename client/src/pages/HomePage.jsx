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

  return (
    <div className="events-container">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading &&
        !error &&
        events.map((event) => <EventCard key={event._id} event={event} />)}
    </div>
  );
};

export default HomePage;
