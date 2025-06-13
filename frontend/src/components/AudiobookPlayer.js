import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../config/config';
import QuizModal from './QuizModal';
import './AudiobookPlayer.css';

export default function AudiobookPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audiobook, setAudiobook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchAudiobook();
  }, [id]);

  useEffect(() => {
    if (audiobook) {
      fetchSimilarBooks();
    }
  }, [audiobook]);

  const fetchAudiobook = async () => {
    try {
      const response = await fetch(`${config.BACKEND_URL}/audiobooks/audiobook/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audiobook');
      }
      const data = await response.json();
      setAudiobook(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audiobook:', error);
      toast.error('Failed to load audiobook');
      setLoading(false);
    }
  };

  const fetchSimilarBooks = async () => {
    if (!audiobook?.genre) {
      console.log('No genre found for audiobook:', audiobook);
      return;
    }
    
    console.log('Fetching similar books for genre:', audiobook.genre);
    setLoadingSimilar(true);
    try {
      const response = await fetch(`${config.BACKEND_URL}/audiobooks?genre=${encodeURIComponent(audiobook.genre)}`);
      console.log('Similar books response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch similar books');
      }
      const data = await response.json();
      console.log('Similar books data:', data);
      
      // Filter out the current audiobook and sort by rating
      const filteredBooks = data.audiobooks
        ?.filter(book => book._id !== audiobook._id)
        ?.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        ?.slice(0, 6) || [];
      
      console.log('Filtered similar books:', filteredBooks);
      setSimilarBooks(filteredBooks);
    } catch (error) {
      console.error('Error fetching similar books:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleSimilarBookClick = (bookId) => {
    navigate(`/audiobook/${bookId}`);
  };

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

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBackClick = () => {
    navigate('/audiobook');
  };

  const handleRatingSubmit = async (rating) => {
    if (rating === 0) return;
    
    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${config.BACKEND_URL}/audiobooks/rate/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const updatedAudiobook = await response.json();
      setAudiobook(updatedAudiobook);
      setUserRating(rating);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
    handleRatingSubmit(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || userRating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`material-icons star ${i <= displayRating ? 'filled' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          style={{ cursor: 'pointer' }}
        >
          {i <= displayRating ? 'star' : 'star_border'}
        </i>
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    return audiobook.averageRating || 0;
  };

  if (loading) {
    return (
      <div className="audiobook-player-loading">
        <div className="loading-spinner"></div>
        <p>Loading audiobook...</p>
      </div>
    );
  }

  if (!audiobook) {
    return (
      <div className="audiobook-player-error">
        <h2>Audiobook not found</h2>
        <button onClick={handleBackClick} className="back-button">
          Back to Audiobooks
        </button>
      </div>
    );
  }

  return (
    <div className="audiobook-player">
      <audio
        ref={audioRef}
        src={audiobook.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => toast.error('Error playing audio')}
      />
      
      <div className="player-header">
        <button onClick={handleBackClick} className="back-button">
          <i className="material-icons">arrow_back</i>
          {/* Back */}
        </button>
        {/* <h1 className="player-title">{audiobook.title}</h1> */}
      </div>

      <div className="player-content">
        <div className="thumbnail-section">
          <div className="thumbnail-container">
            <img 
              src={audiobook.thumbnailUrl} 
              alt={audiobook.title}
              className="fullscreen-thumbnail"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x600?text=No+Image";
              }}
            />
          </div>

          <div className="player-controls">
            <div className="track-info">
              <h2 className="track-title">{audiobook.title}</h2>
              <p className="track-author">By {audiobook.author}</p>
              
              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-label">Average Rating:</span>
                  <div className="stars-display">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i
                        key={star}
                        className={`material-icons star ${star <= calculateAverageRating() ? 'filled' : ''}`}
                      >
                        {star <= calculateAverageRating() ? 'star' : 'star_border'}
                      </i>
                    ))}
                    <span className="rating-value">({calculateAverageRating()})</span>
                  </div>
                </div>
                
                <div className="user-rating">
                  <span className="rating-label">Your Rating:</span>
                  <div className="stars-input">
                    {renderStars()}
                  </div>
                  {isSubmittingRating && (
                    <span className="rating-submitting">Submitting...</span>
                  )}
                </div>
              </div>

              {audiobook.description && (
                <p className="track-description">{audiobook.description}</p>
              )}
            </div>

            <div className="progress-container">
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
                className="progress-bar"
              />
            </div>

            <div className="main-controls">
              <button 
                className="control-button play-pause-button"
                onClick={togglePlayPause}
              >
                <i className="material-icons">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </i>
              </button>
            </div>

            <div className="secondary-controls">
              <div className="volume-control">
                <i className="material-icons">volume_up</i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <div className="playback-rate-control">
                <span className="rate-label">Speed:</span>
                <div className="rate-buttons">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      className={`rate-button ${playbackRate === rate ? 'active' : ''}`}
                      onClick={() => handlePlaybackRateChange(rate)}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="quiz-section">
                <button 
                  className="quiz-button"
                  onClick={() => setShowQuizModal(true)}
                >
                  <i className="material-icons">quiz</i>
                  Test Your Knowledge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Books Section */}
        <div className="similar-books-section">
          <h3 className="similar-books-title">
            Similar Books in {audiobook.genre || 'Unknown Genre'}
          </h3>
          
          {loadingSimilar ? (
            <div className="similar-books-loading">
              <p>Loading similar books...</p>
            </div>
          ) : similarBooks.length > 0 ? (
            <div className="similar-books-grid">
              {similarBooks.map((book) => (
                <div
                  key={book._id}
                  className="similar-book-card"
                  onClick={() => handleSimilarBookClick(book._id)}
                >
                  <div className="similar-book-thumbnail">
                    <img 
                      src={book.thumbnailUrl} 
                      alt={book.title}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x200?text=No+Image";
                      }}
                    />
                    <div className="similar-book-overlay">
                      <span className="similar-book-duration">
                        {formatDuration(Number(book.duration))}
                      </span>
                      <div className="similar-book-rating">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={`star ${index < Math.floor(book.averageRating || 0) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-value">({(book.averageRating || 0).toFixed(1)})</span>
                      </div>
                    </div>
                  </div>
                  <div className="similar-book-details">
                    <h4 className="similar-book-title">{book.title}</h4>
                    <p className="similar-book-author">By {book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="similar-books-empty">
              <p>No similar books found for this genre.</p>
              <p>Debug: Genre = {audiobook.genre}, Similar books count = {similarBooks.length}</p>
            </div>
          )}
        </div>
      </div>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        audiobookId={id}
        audiobookTitle={audiobook?.title}
      />
    </div>
  );
} 