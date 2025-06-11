import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';
import VideoCard from '../components/VideoCard';
import VideoUploadModal from '../components/VideoUploadModal';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import './Videos.css';

const Videos = () => {
  const { state } = useContext(UserContext);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, sortBy]);

  const fetchVideos = async () => {
    try {
      const queryString = new URLSearchParams({
        q: searchQuery,
        sort: sortBy
      }).toString();

      const response = await fetch(`${config.BACKEND_URL}/allvideos?${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    navigate('/profile');
  };

  return (
    <div className="videos-container">
      <div className="videos-header">
        <div className="search-sort-container">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <select value={sortBy} onChange={handleSort} className="sort-select">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="mostLiked">Most Liked</option>
          </select>
        </div>
      </div>

      <div className="videos-grid">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onVideoUpdate={fetchVideos}
          />
        ))}
      </div>

      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default Videos; 