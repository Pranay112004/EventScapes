import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateGroupForm = ({ onGroupCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/groups", formData, {
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        }
      });
      
      toast.success("Group created successfully!");
      onGroupCreated(data);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-form-overlay">
      <div className="create-group-form">
        <div className="form-header">
          <h2>Create New Group</h2>
          <button 
            onClick={onCancel}
            className="close-button"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your group..."
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
              />
              <span className="checkbox-text">
                🔒 Make this group private
                <small>Only invited members can see and join this group</small>
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="button-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
