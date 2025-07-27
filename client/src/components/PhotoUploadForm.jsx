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
      <h3>Upload Media to This Event</h3>
      <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Support images (JPG, PNG, GIF) and videos (MP4, MOV, AVI)
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          required
        />
        <input
          type="text"
          placeholder="Optional caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Media"}
        </button>
      </form>
    </div>
  );
};

export default PhotoUploadForm;
