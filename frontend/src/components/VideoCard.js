import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import './VideoCard.css';

const VideoCard = ({ video, onVideoUpdate }) => {
  const { state } = useContext(UserContext);
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    return videoDate.toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLike = async () => {
    if (!state) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/like', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          videoId: video._id
        })
      });

      if (response.ok) {
        onVideoUpdate();
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/delete/${video._id}`, {
        method: 'delete',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (response.ok) {
        onVideoUpdate();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="video-card">
      <Link to={`/video/${video._id}`} className="video-thumbnail">
        <img src={video.thumbnailUrl} alt={video.title} />
        <div className="video-duration">
          {formatDuration(video.duration)}
        </div>
      </Link>

      <div className="video-info">
        <div className="video-header">
          <Link to={`/profile/${video.postedBy._id}`} className="channel-avatar">
            <img 
              src={video.postedBy.Photo || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"} 
              alt={video.postedBy.name}
            />
          </Link>
          <div className="video-details">
        <Link to={`/video/${video._id}`} className="video-title">
          {video.title}
        </Link>
          <Link to={`/profile/${video.postedBy._id}`} className="channel-name">
            {video.postedBy.name}
          </Link>
          <div className="video-stats">
              <span className="views">{formatViews(video.views)}</span>
            <span className="dot">•</span>
              <span className="upload-time">{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="video-actions">
          <button
            className={`like-button ${video.likes.includes(state?._id) ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <i className="material-icons">thumb_up</i>
            <span>{video.likes.length}</span>
          </button>

          {state && video.postedBy._id === state._id && (
            <div className="video-options">
              <button
                className="options-button"
                onClick={() => setShowOptions(!showOptions)}
              >
                <i className="material-icons">more_vert</i>
              </button>
              {showOptions && (
                <div className="options-menu">
                  <button onClick={handleDelete}>
                    <i className="material-icons">delete</i>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 