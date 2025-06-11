import React, { useState, useContext } from 'react';
import { UserContext } from '../App';
import './VideoUploadModal.css';
import config from '../config/config';

const ReelUploadModal = ({ onClose, onUploadSuccess }) => {
  const { state } = useContext(UserContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
    category: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState({
    video: null,
    thumbnail: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview for thumbnail
      if (name === 'thumbnail' && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(prev => ({
            ...prev,
            thumbnail: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }

      // Create preview for video
      if (name === 'video' && file) {
        const videoUrl = URL.createObjectURL(file);
        setPreview(prev => ({
          ...prev,
          video: videoUrl
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state) return;

    setUploading(true);
    setError('');

    try {
      console.log('Preparing reel upload with form data:', {
        title: formData.title,
        description: formData.description,
        video: formData.video,
        thumbnail: formData.thumbnail,
        category: formData.category
      });

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('video', formData.video);
      formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('category', formData.category);

      console.log('Sending reel upload request...');
      const response = await fetch(`${config.BACKEND_URL}/upload-reel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('Reel upload response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Reel upload failed');
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Reel upload error:', err);
      setError(err.message || 'Failed to upload reel. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Reel</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter reel title"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter reel description"
              rows="4"
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              onChange={handleChange}
              accept="image/*"
              required
            />
            {preview.thumbnail && (
              <div className="preview-container">
                <img src={preview.thumbnail} alt="Thumbnail preview" className="thumbnail-preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="video">Reel Video</label>
            <input
              type="file"
              id="video"
              name="video"
              onChange={handleChange}
              accept="video/*"
              required
            />
            {preview.video && (
              <div className="preview-container">
                <video src={preview.video} controls className="video-preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="education">Education</option>
              <option value="business">Business</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports-fitness">Sports/Fitness</option>
              <option value="gaming">Gaming</option>
              <option value="food-travel">Food/Travel</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReelUploadModal; 