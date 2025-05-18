import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./bottombar.css";

export default function BottomNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-navbar">
      <Link to="/" className={`bottom-nav-item ${isActive("/") ? "active" : ""}`}>
        <i className="material-icons">home</i>
        <span>Home</span>
      </Link>
      <Link to="/reels" className={`bottom-nav-item ${isActive("/reels") ? "active" : ""}`}>
        <i className="material-icons">movie</i>
        <span>Reels</span>
      </Link>
      <Link to="/videos" className={`bottom-nav-item ${isActive("/videos") ? "active" : ""}`}>
        <i className="material-icons">videocam</i>
        <span>Long Videos</span>
      </Link>
      <Link to="/profile" className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}>
        <i className="material-icons">person</i>
        <span>Profile</span>
      </Link>
    </div>
  );
}