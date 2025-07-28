import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditEventPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        const { title, description, date, location, imageUrl } = res.data;
        setFormData({ 
          title: title || "", 
          description: description || "", 
          date: date || "", 
          location: location || "", 
          imageUrl: imageUrl || "" 
        });
      } catch (err) {
        console.error("Could not fetch event data for editing", err);
        toast.error("Could not load event data.");
        navigate(`/event/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id, navigate]);

  const { title, description, date, location, imageUrl } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating event...");
    
    try {
      const config = { headers: { "x-auth-token": token } };
      await axios.put(`/api/events/${id}`, formData, config);
      toast.success("Event updated successfully!", { id: toastId });
      navigate(`/event/${id}`);
    } catch (err) {
      console.error(err.response?.data);
      toast.error(
        err.response?.data?.msg || "Event update failed. Please try again.",
        { id: toastId }
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Edit Event</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            placeholder="Enter event title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Enter event description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Event Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={onChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            placeholder="Enter event location"
            name="location"
            value={location}
            onChange={onChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Cover Image URL *</label>
          <input
            type="url"
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            name="imageUrl"
            value={imageUrl}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(`/event/${id}`)}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
