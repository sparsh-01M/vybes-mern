import React, { useContext, useState, useEffect } from "react";
import logo from "../img/logo.png";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { toast } from "react-toastify";
import VideoUploadModal from "./VideoUploadModal";
import ReelUploadModal from "./ReelUploadModal";

export default function Navbar({ login }) {
  const { setUserLogin, setModalOpen } = useContext(LoginContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReelUploadModal, setShowReelUploadModal] = useState(false);
  const navigate = useNavigate();

  // Check login status on component mount and when login prop changes
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");
    if (token && user) {
      setUserLogin(true);
    }
  }, [login, setUserLogin]);

  const handleAudiobookClick = (e) => {
    e.preventDefault();
    navigate("/audiobooks");
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    navigate('/profile');
  };

  const handleReelUploadSuccess = () => {
    setShowReelUploadModal(false);
    navigate('/profile');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");
    console.log("Login status check - Token:", !!token, "User:", !!user);
    
    if (login || (token && user)) {
      return [
        <li key="menu-container" className="menu-container">
            <div className="hamburger-icon" onClick={toggleMenu}>
              <i className="material-icons">menu</i>
            </div>
            {menuOpen && (
              <div className="dropdown-menu">
              <Link key="create-post" to="/createPost" onClick={toggleMenu}>
                  <div className="menu-item">
                    <i className="material-icons">add_circle</i>
                    <span>Create Post</span>
                  </div>
                </Link>
              <div 
                key="upload-video"
                className="menu-item" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu();
                  setShowUploadModal(true);
                }}
              >
                  <i className="material-icons">video_library</i>
                  <span>Upload Video</span>
                </div>
              <div 
                key="upload-reel"
                className="menu-item" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu();
                  setShowReelUploadModal(true);
                }}
              >
                  <i className="material-icons">movie</i>
                  <span>Upload Reel</span>
                </div>
              <Link key="following" to="/followingpost" onClick={toggleMenu}>
                  <div className="menu-item">
                    <i className="material-icons">people</i>
                    <span>My Following</span>
                  </div>
                </Link>
                <div 
                key="logout"
                  className="menu-item logout-item" 
                  onClick={() => {
                    toggleMenu();
                    setModalOpen(true);
                  }}
                >
                  <i className="material-icons">exit_to_app</i>
                  <span>Log Out</span>
                </div>
              </div>
            )}
          </li>
      ];
    } else {
      return [
        <li key="signup">
          <Link to="/signup">Sign Up</Link>
        </li>,
        <li key="signin">
          <Link to="/signin">Sign In</Link>
        </li>
      ];
    }
  };

  return (
    <div className="navbar">
      <h2 className="logo">Vybes</h2>
      <div className="nav-right">
        <div className="nav-buttons">
          <a href="#" onClick={handleAudiobookClick} className="nav-button audiobook-button">
            <i className="material-icons">headphones</i>
          </a>
          <Link to="/ai-chat" className="nav-button ai-chat-button">
            <i className="material-icons">smart_toy</i>
          </Link>
        </div>
        <ul className="nav-menu">{loginStatus()}</ul>
      </div>

      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      {showReelUploadModal && (
        <ReelUploadModal
          onClose={() => setShowReelUploadModal(false)}
          onUploadSuccess={handleReelUploadSuccess}
        />
      )}
    </div>
  );
}