import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditEventPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    imageUrl: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        const { title, date, imageUrl } = res.data;
        setFormData({ title, date, imageUrl });
      } catch (err) {
        console.error("Could not fetch event data for editing", err);
        alert("Could not load event data.");
        navigate(`/event/${id}`);
      }
    };
    fetchEventData();
  }, [id, navigate]);

  const { title, date, imageUrl } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { "x-auth-token": token } };
      await axios.put(`/api/events/${id}`, formData, config);
      navigate(`/event/${id}`); // Navigate back to the event's page
    } catch (err) {
      console.error(err.response.data);
      alert("Event update failed. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Event</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          name="title"
          value={title}
          onChange={onChange}
          required
        />
        <input
          type="text"
          placeholder="Event Date"
          name="date"
          value={date}
          onChange={onChange}
        />
        <input
          type="text"
          placeholder="Image URL for the event cover"
          name="imageUrl"
          value={imageUrl}
          onChange={onChange}
          required
        />
        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default EditEventPage;
