import React, { useContext, useState } from "react";
import logo from "../img/logo.png";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    if (login || token) {
      return [
        <>
          <li className="menu-container">
            <div className="hamburger-icon" onClick={toggleMenu}>
              <i className="material-icons">menu</i>
            </div>
            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/createPost" onClick={toggleMenu}>
                  <div className="menu-item">
                    <i className="material-icons">add_circle</i>
                    <span>Create Post</span>
                  </div>
                </Link>
                <Link to="/followingpost" onClick={toggleMenu}>
                  <div className="menu-item">
                    <i className="material-icons">people</i>
                    <span>My Following</span>
                  </div>
                </Link>
                <div 
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
        </>,
      ];
    } else {
      return [
        <>
          <Link to="/signup">
            <li>Sign Up</li>
          </Link>
          <Link to="/signin">
            <li>Sign In</li>
          </Link>
        </>,
      ];
    }
  };

  return (
    <div className="navbar">
      <h2 className="logo">Vybes</h2>
      <div className="nav-right">
        <div className="nav-buttons">
          <Link to="/ai-bot" className="nav-button">
            <i className="material-icons">smart_toy</i>
            <span>AI Bot</span>
          </Link>
          <Link to="/audiobooks" className="nav-button">
            <i className="material-icons">library_music</i>
            <span>Audiobook</span>
          </Link>
        </div>
        <ul className="nav-menu">{loginStatus()}</ul>
      </div>
    </div>
  );
}