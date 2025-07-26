import React, { useState } from "react";
import axios from "axios";

// This component will receive a function from App.jsx to update the events list
const CreateEventForm = ({ onEventCreated }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const newEventData = { title, date, imageUrl };

    try {
      // Send a POST request to create the new event
      const response = await axios.post(
        "/api/events",
        newEventData
      );

      // Call the function passed from App.jsx with the new event data
      onEventCreated(response.data);

      // Clear the form fields
      setTitle("");
      setDate("");
      setImageUrl("");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Create a New Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Event Date (e.g., August 2025)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEventForm;
