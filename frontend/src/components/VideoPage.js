import React, { useState, useEffect } from 'react';
import './VideoPage.css';

const VideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/videos');
      const data = await response.json();
      setVideos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('video', uploadData.file);

    try {
      const response = await fetch('http://localhost:4000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setShowUpload(false);
        fetchVideos();
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div className="video-page">
      <div className="video-header">
        <div className="search-bar">
          <i className="material-icons">search</i>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="upload-btn" onClick={() => setShowUpload(true)}>
          <i className="material-icons">add</i>
        </button>
      </div>

      {showUpload && (
        <div className="upload-modal">
          <div className="upload-content">
            <h2>Upload Video</h2>
            <form onSubmit={handleUpload}>
              <input
                type="text"
                placeholder="Title"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
              />
              <div className="upload-actions">
                <button type="submit">Upload</button>
                <button type="button" onClick={() => setShowUpload(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="videos-grid">
        {videos.map((video) => (
          <div key={video._id} className="video-card">
            <video
              src={video.url}
              poster={video.thumbnail}
              onClick={(e) => e.target.play()}
              onBlur={(e) => e.target.pause()}
            />
            <div className="video-info">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <div className="video-stats">
                <span><i className="material-icons">visibility</i> {video.views}</span>
                <span><i className="material-icons">thumb_up</i> {video.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;