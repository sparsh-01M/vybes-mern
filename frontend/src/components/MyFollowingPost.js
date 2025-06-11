import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function MyFolliwngPost() {
  const navigate = useNavigate();
  const [followedUsers, setFollowedUsers] = useState([]);
  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  // Get current user's ID from localStorage
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  // Handle profile click
  const handleProfileClick = (userId) => {
    if (userId === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("./signup");
    }

    // Get current user data for debugging
    const currentUser = JSON.parse(localStorage.getItem("user"));
    console.log("Current user data:", currentUser);

    // Fetching followed users
    fetch("http://localhost:4000/myfollwingpost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Raw API response:", result);
        
        // If result is an array of posts, extract unique users
        if (Array.isArray(result)) {
          const uniqueUsers = result.reduce((acc, post) => {
            if (post.postedBy && !acc.some(user => user._id === post.postedBy._id)) {
              acc.push({
                _id: post.postedBy._id,
                name: post.postedBy.name,
                Photo: post.postedBy.Photo
              });
            }
            return acc;
  }, []);

          console.log("Extracted unique users:", uniqueUsers);
          setFollowedUsers(uniqueUsers);
    } else {
          console.log("Unexpected API response format:", result);
          setFollowedUsers([]);
        }
    })
      .catch((err) => {
        console.error("Error fetching followed users:", err);
        setFollowedUsers([]);
      });
  }, []);

  return (
    <div className="home">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>People You Follow</h2>
      
      {followedUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>No followed users</h3>
          <p>Start following people to see their profiles here!</p>
            </div>
      ) : (
        <div className="followed-users-grid">
          {followedUsers.map((user) => (
            <div 
              className="user-card" 
              key={user._id}
              onClick={() => handleProfileClick(user._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-profile">
                <div className="user-pic">
                  <img
                    src={user.Photo || defaultProfilePic}
                    alt={user.name}
                    onError={(e) => {
                      console.log("Error loading profile picture:", e);
                      e.target.src = defaultProfilePic;
                    }}
                  />
                </div>
                <div className="user-info">
                  <h4>{user.name}</h4>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
