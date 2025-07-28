import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { title, description, date, location, imageUrl } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      };
      const res = await axios.post("/api/events", formData, config);
      navigate(`/event/${res.data._id}`); // Navigate to the new event's page
    } catch (err) {
      console.error(err.response.data);
      alert("Event creation failed. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Create a New Event</h2>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Event Title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
          <input
            type="datetime-local"
            placeholder="Event Date & Time"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </div>
        
        <input
          type="text"
          placeholder="Event Location (Optional)"
          name="location"
          value={location}
          onChange={onChange}
        />
        
        <textarea
          placeholder="Event Description (Optional)"
          name="description"
          value={description}
          onChange={onChange}
          rows="4"
        />
        
        <input
          type="url"
          placeholder="Event Cover Image URL"
          name="imageUrl"
          value={imageUrl}
          onChange={onChange}
          required
        />
        
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEventPage;
