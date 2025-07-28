import React, { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const MultiFileUpload = ({ onUpload, onCancel, uploading }) => {
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 100MB`);
        return false;
      }
      
      return true;
    });

    const totalFiles = files.length + validFiles.length;
    if (totalFiles > 20) {
      toast.error(`Maximum 20 files allowed. You can add ${20 - files.length} more files.`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      // Reindex captions
      const reindexed = {};
      Object.keys(newCaptions).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newCaptions[key];
        } else if (numKey < index) {
          reindexed[numKey] = newCaptions[key];
        }
      });
      return reindexed;
    });
  };

  const updateCaption = (index, caption) => {
    setCaptions(prev => ({ ...prev, [index]: caption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    onUpload(files, captions);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('image/')) return '🖼️';
    return '📄';
  };

  return (
    <div className="multi-file-upload-overlay">
      <div className="multi-file-upload-modal">
        <div className="upload-header">
          <h2>Upload Photos & Videos</h2>
          <button 
            type="button"
            onClick={onCancel}
            className="close-btn"
            disabled={uploading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Drag and Drop Area */}
          <div 
            className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            
            <div className="dropzone-content">
              <div className="upload-icon">📁</div>
              <h3>Drag & drop files here</h3>
              <p>or click to browse</p>
              <div className="upload-info">
                <span className="file-limit">Max 20 files • Images & Videos • Up to 100MB each</span>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="files-preview">
              <div className="files-header">
                <h3>Selected Files ({files.length}/20)</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setCaptions({});
                  }}
                  className="clear-all-btn"
                  disabled={uploading}
                >
                  Clear All
                </button>
              </div>

              <div className="files-list">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="file-preview-item">
                    <div className="file-preview">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="file-thumbnail"
                        />
                      ) : (
                        <div className="file-thumbnail video-thumbnail">
                          <span className="file-icon">🎥</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="file-details">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      
                      <div className="file-caption">
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={captions[index] || ''}
                          onChange={(e) => updateCaption(index, e.target.value)}
                          className="caption-input"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-btn"
                      disabled={uploading}
                      title="Remove file"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Actions */}
          <div className="upload-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={uploading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="upload-btn"
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <div className="upload-spinner"></div>
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiFileUpload;
