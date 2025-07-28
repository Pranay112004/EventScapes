import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PhotoUploadForm = ({ eventId, onPhotoUploaded }) => {
  const [files, setFiles] = useState([]);
  const [globalCaption, setGlobalCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('single');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 20) {
      toast.error("You can only upload up to 20 files at once.");
      return;
    }
    
    const validFiles = selectedFiles.filter(file => {
      // Check for valid file types including HEIC/HEIF
      const isValidImageType = file.type.startsWith('image/');
      const isValidVideoType = file.type.startsWith('video/');
      const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      const isValidType = isValidImageType || isValidVideoType || isHEIC;
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file. Supported formats: JPG, PNG, GIF, HEIC, HEIF, MP4, MOV, AVI`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB).`);
        return false;
      }
      return true;
    });
    
    setFiles(validFiles);
    setUploadMode(validFiles.length > 1 ? 'multiple' : 'single');
  };

  const handleSingleUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", globalCaption);

    const token = localStorage.getItem("token");

    const res = await axios.post(`/api/photos/upload/${eventId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-auth-token": token,
      },
    });

    return res.data;
  };

  const handleMultipleUpload = async (files) => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append("images", file);
      formData.append("captions", globalCaption || `Photo ${index + 1}`);
    });

    const token = localStorage.getItem("token");

    const res = await axios.post(`/api/photos/upload-multiple/${eventId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-auth-token": token,
      },
    });

    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    try {
      if (uploadMode === 'single') {
        const uploadedPhoto = await handleSingleUpload(files[0]);
        onPhotoUploaded(uploadedPhoto);
        toast.success("Photo uploaded successfully!", { id: toastId });
      } else {
        const result = await handleMultipleUpload(files);
        result.photos.forEach(photo => { onPhotoUploaded(photo); });
        toast.success(`${result.count} photos uploaded successfully!`, { id: toastId });
      }

      setFiles([]);
      setGlobalCaption("");
      setUploadProgress(100);
      e.target.reset();
    } catch (err) {
      console.error("Error uploading photos:", err);
      toast.error(
        err.response?.data?.msg || "Photo upload failed. Please try again.",
        { id: toastId }
      );
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    setUploadMode(updatedFiles.length > 1 ? 'multiple' : 'single');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="form-container">
      <h3>Upload Media to This Event</h3>
      <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Support images (JPG, PNG, GIF, HEIC, HEIF) and videos (MP4, MOV, AVI) • Max 20 files • 10MB per file
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*,.heic,.heif"
            multiple
            className="file-input"
            id="media-upload"
          />
          <label htmlFor="media-upload" className="file-input-label">
            📎 Choose Files (Up to 20)
          </label>
        </div>
        
        {/* File Preview */}
        {files.length > 0 && (
          <div className="file-preview">
            <h4>Selected Files ({files.length}):</h4>
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({formatFileSize(file.size)})</span>
                    <span className="file-type">
                      {file.type.startsWith('video/') ? '🎥' : 
                       (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) ? '📱' : '📷'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <input
          type="text"
          placeholder={uploadMode === 'multiple' ? 'Global caption for all files' : 'Optional caption'}
          value={globalCaption}
          onChange={(e) => setGlobalCaption(e.target.value)}
          className="caption-input"
        />
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={uploading || files.length === 0}
          className="upload-btn"
        >
          {uploading 
            ? `Uploading ${files.length} file(s)...` 
            : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
          }
        </button>
      </form>
    </div>
  );
};

export default PhotoUploadForm;
