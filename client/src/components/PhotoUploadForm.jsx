import React, { useState } from "react"; // The fix is on this line
import axios from "axios";

const PhotoUploadForm = ({ eventId, onPhotoUploaded }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(`/api/photos/upload/${eventId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-auth-token": token,
        },
      });

      onPhotoUploaded(res.data);
      setFile(null);
      setCaption("");
      // Clear the file input visually
      e.target.reset();
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Photo upload failed. You must be logged in.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Upload a Photo to This Event</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <input
          type="text"
          placeholder="Optional caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default PhotoUploadForm;
