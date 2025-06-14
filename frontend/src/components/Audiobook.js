import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Audiobook.css";
import { toast } from "react-toastify";
import config from "../config/config.js";

// Rolling Ball Loading Animation Component
const RollingBallLoader = () => {
  return (
    <div className="rolling-ball-loader">
      <div className="rolling-ball-container">
        <div className="rolling-ball"></div>
        <div className="rolling-track"></div>
        <div className="loading-text">Loading audiobooks...</div>
      </div>
    </div>
  );
};

export default function Audiobook() {
  const navigate = useNavigate();
  const [genreGroups, setGenreGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGenres, setExpandedGenres] = useState({});
  const [genrePages, setGenrePages] = useState({});

  // Toast function for errors
  const notifyError = (msg) => toast.error(msg);

  // Function to get audio duration
  const getAudioDuration = async (audioUrl) => {
    try {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.round(audio.duration));
        });
        audio.addEventListener('error', () => {
          console.error('Error loading audio:', audioUrl);
          resolve(0);
        });
        audio.src = audioUrl;
      });
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchAudiobooks = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/audiobooks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (!Array.isArray(result)) {
          throw new Error("Expected array of genre groups");
        }

        if (result.length === 0) {
          console.log("No audiobooks found in database");
          setGenreGroups([]);
          setLoading(false);
          return;
        }

        // Initialize genre pages
        const initialPages = {};
        result.forEach(group => {
          initialPages[group.genre] = 1;
        });
        setGenrePages(initialPages);

        setGenreGroups(result);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching audiobooks:", err);
        notifyError("Failed to fetch audiobooks");
        setLoading(false);
      }
    };

    fetchAudiobooks();
  }, []);

  const handleCardClick = (audiobookId) => {
    navigate(`/audiobook/${audiobookId}`);
  };

  const handleSeeMore = async (genre) => {
    try {
      const nextPage = (genrePages[genre] || 1) + 1;
      const response = await fetch(`${config.BACKEND_URL}/audiobooks?genre=${encodeURIComponent(genre)}&page=${nextPage}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the genre group with additional books
      setGenreGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.genre === genre) {
            return {
              ...group,
              books: [...group.books, ...data.audiobooks],
              hasMore: nextPage < data.totalPages
            };
          }
          return group;
        })
      );

      // Update the page number for this genre
      setGenrePages(prev => ({
        ...prev,
        [genre]: nextPage
      }));

    } catch (err) {
      console.error("Error loading more books:", err);
      notifyError("Failed to load more books");
    }
  };

  // Format duration from seconds to HH:MM:SS or MM:SS
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <RollingBallLoader />;
  }

  if (genreGroups.length === 0) {
    return <div className="loading">No audiobooks found</div>;
  }

  return (
    <div className="audiobook-container">
      <h1 className="audiobook-title">Audiobooks</h1>
      {genreGroups.map((group) => (
        <div key={group.genre} className="genre-section">
          <h2 className="genre-title">{group.genre}</h2>
          <div className="audiobook-grid">
            {group.books.map((book) => (
              <div
                key={book._id}
                className="audiobook-card"
                onClick={() => handleCardClick(book._id)}
              >
                <div className="audiobook-thumbnail">
                  <img 
                    src={book.thumbnailUrl} 
                    alt={book.title || "Audiobook cover"} 
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                    }}
                  />
                  {/* Meta overlay for mobile */}
                  <div className="audiobook-meta-overlay">
                    <span className="audiobook-duration">
                      {formatDuration(Number(book.duration))}
                    </span>
                    <div className="audiobook-rating">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`star ${index < Math.floor(book.averageRating || 0) ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="rating-value">({(book.averageRating || 0).toFixed(1)}) - {book.totalRatings || 0} ratings</span>
                    </div>
                  </div>
                </div>
                <div className="audiobook-details">
                  <h3 className="audiobook-name">
                    {book.title || "No Title Available"}
                  </h3>
                  <p className="audiobook-author">
                    By {book.author || "Unknown Author"}
                  </p>
                  {book.description && (
                    <p className="audiobook-description">
                      {book.description}
                    </p>
                  )}
                  {/* Meta section for desktop */}
                  <div className="audiobook-meta">
                    <span className="audiobook-duration">
                      {formatDuration(Number(book.duration))}
                    </span>
                    <div className="audiobook-rating">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`star ${index < Math.floor(book.averageRating || 0) ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="rating-value">({(book.averageRating || 0).toFixed(1)}) - {book.totalRatings || 0} ratings</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {group.hasMore && (
            <button 
              className="see-more-button"
              onClick={() => handleSeeMore(group.genre)}
            >
              See More
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 