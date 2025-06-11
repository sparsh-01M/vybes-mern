import React, { useEffect, useState, useCallback } from "react";
import "./Profile.css";
import VideoCard from "./VideoCard";
import PostDetail from "./PostDetail";
import ProfilePic from "./ProfilePic";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userid } = useParams();
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  
  // State declarations
  const [pic, setPic] = useState([]);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState("");
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isFollow, setIsFollow] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfilePic, setShowProfilePic] = useState(false);

  // Set active tab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // If we came from a post, ensure we're on the profile tab
      if (location.state.fromPost) {
        // Clear the state after using it
        navigate(location.pathname, { 
          replace: true, 
          state: { activeTab: 'posts' }  // Keep the posts tab active
        });
      } else {
        // Clear the state after using it
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, navigate, location.pathname]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.log("No JWT token found");
        toast.error("Please login to view profile");
        return;
      }

      // Get user ID from token or params
      const storedUserData = JSON.parse(localStorage.getItem("user"));
      if (!storedUserData || !storedUserData._id) {
        console.error("No user data found in localStorage");
        toast.error("User data not found. Please login again.");
        return;
      }

      const userId = userid || storedUserData._id;
      console.log("Fetching data for user:", userId);

      // Fetch user data and posts
      const userRes = await fetch(`http://localhost:4000/user/${userId}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!userRes.ok) {
        const errorText = await userRes.text();
        console.error("User data fetch failed:", {
          status: userRes.status,
          statusText: userRes.statusText,
          error: errorText
        });
        throw new Error(`Failed to fetch user data: ${userRes.status} ${userRes.statusText}`);
      }

      const fetchedUserData = await userRes.json();
      console.log("User data response:", fetchedUserData);

      if (!fetchedUserData || !fetchedUserData.user) {
        console.error("Invalid user data response:", fetchedUserData);
        throw new Error("Invalid user data received from server");
      }

      setUser(fetchedUserData.user);
      setUserProfile(fetchedUserData.user);
      setPosts(fetchedUserData.post || []);

      // Check if current user is following this profile
      if (fetchedUserData.user.followers?.includes(storedUserData._id)) {
        setIsFollow(true);
      }

      // Fetch user's videos with correct endpoint
      console.log("Fetching videos for user:", userId);
      const videosRes = await fetch(`http://localhost:4000/video/user/${userId}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!videosRes.ok) {
        if (videosRes.status === 404) {
          console.log("No videos found for user");
          setVideos([]);
          return;
        }
        throw new Error(`Failed to fetch videos: ${videosRes.status}`);
      }

      const videosData = await videosRes.json();
      console.log("Raw videos data:", videosData);
      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      console.error("Error stack:", err.stack);
      setVideos([]);
      setPosts([]);
      setUser(null);
      setUserProfile(null);
      
      // More specific error messages
      if (err.message.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection.");
      } else if (err.message.includes("Invalid user data")) {
        toast.error("Invalid user data received. Please try logging in again.");
      } else {
        toast.error(err.message || "Error loading profile data");
      }
    } finally {
      setLoading(false);
    }
  }, [userid]);

  // Update useEffect to use fetchData
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Add fetchData as dependency

  // Follow user
  const followUser = async (userId) => {
    try {
      const res = await fetch("http://localhost:4000/follow", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          followId: userId,
        }),
      });
      const data = await res.json();
      console.log(data);
      setIsFollow(true);
      
      // Update user profile with new follower
      setUserProfile(prev => ({
        ...prev,
        followers: [...(prev?.followers || []), JSON.parse(localStorage.getItem("user"))._id]
      }));
      
      toast.success("Following user");
    } catch (err) {
      console.error("Error following user:", err);
      toast.error("Error following user");
    }
  };

  // Unfollow user
  const unfollowUser = async (userId) => {
    try {
      const res = await fetch("http://localhost:4000/unfollow", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          followId: userId,
        }),
      });
      const data = await res.json();
      console.log(data);
      setIsFollow(false);
      
      // Update user profile by removing follower
      setUserProfile(prev => ({
        ...prev,
        followers: (prev?.followers || []).filter(id => id !== JSON.parse(localStorage.getItem("user"))._id)
      }));
      
      toast.success("Unfollowed user");
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error("Error unfollowing user");
    }
  };

  // Update handleVideoUpdate to use correct endpoint
  const handleVideoUpdate = () => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userid || userData._id;

        const videosRes = await fetch(`http://localhost:4000/video/user/${userId}`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!videosRes.ok) {
          throw new Error(`Failed to fetch videos: ${videosRes.status}`);
        }

        const videosData = await videosRes.json();
        setVideos(Array.isArray(videosData) ? videosData : []);
      } catch (err) {
        console.error("Error refetching videos:", err);
        toast.error("Error refreshing videos");
      }
    };
    fetchVideos();
  };

  // Add function to handle profile picture change
  const handleProfilePicChange = () => {
    setShowProfilePic(false);
    // Refetch user data to get updated profile picture
    fetchData();
  };

  const toggleDetails = (post) => {
    setShow(!show);
    setPic(post);
  };

  if (loading) {
    return <div className="profile">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="profile">
        <div className="error-message">
          <h2>Unable to load profile</h2>
          <p>Please try refreshing the page or logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      {/* Profile frame */}
      <div className="profile-frame">
        {/* profile-pic */}
        <div className="profile-pic">
          <img 
            src={user.Photo ? user.Photo : picLink} 
            alt="" 
            onClick={() => {
              if (user._id === JSON.parse(localStorage.getItem("user"))._id) {
                setShowProfilePic(true);
              } else {
                navigate("/profile");
              }
            }}
            style={{ cursor: user._id === JSON.parse(localStorage.getItem("user"))._id ? 'pointer' : 'default' }}
          />
        </div>
        {/* profile-data */}
        <div className="profile-data">
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h1>{user.name}</h1>
            {user._id !== JSON.parse(localStorage.getItem("user"))._id && (
              <button
                className="followBtn"
                onClick={() => {
                  if (isFollow) {
                    unfollowUser(user._id);
                  } else {
                    followUser(user._id);
                  }
                }}
              >
                {isFollow ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <div className="profile-info" style={{ display: "flex" }}>
            <p>{posts ? posts.length : 0} posts</p>
            <p>{videos ? videos.length : 0} videos</p>
            <p>{user.followers ? user.followers.length : 0} followers</p>
            <p>{user.following ? user.following.length : 0} following</p>
          </div>
        </div>
      </div>
      <hr
        style={{
          width: "90%",
          opacity: "0.8",
          margin: "25px auto",
        }}
      />

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <div className="gallery">
          {posts && posts.map((pics) => (
            <img
              key={pics._id}
              src={pics.photo}
              className="item"
              alt=""
              onClick={() => toggleDetails(pics)}
            />
          ))}
        </div>
      ) : (
        <div className="videos-grid">
          {videos && videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onVideoUpdate={handleVideoUpdate}
            />
          ))}
        </div>
      )}
      {show && (
        <PostDetail 
          item={pic} 
          toggleDetails={toggleDetails} 
          isProfilePage={true}
          activeTab={activeTab}
        />
      )}

      {/* Add ProfilePic modal */}
      {showProfilePic && (
        <ProfilePic changeprofile={handleProfilePicChange} />
      )}
    </div>
  );
} 