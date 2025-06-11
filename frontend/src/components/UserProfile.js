import React, { useEffect, useState } from "react";
// import PostDetail from "./PostDetail";
import "./Profile.css";
import { useParams } from "react-router-dom";
import VideoCard from "./VideoCard";
import { toast } from "react-toastify";

export default function UserProfie() {
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const { userid } = useParams();
  const [isFollow, setIsFollow] = useState(false);
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'videos'
  const [loading, setLoading] = useState(true);

  // to follow user
  const followUser = (userId) => {
    fetch("http://localhost:4000/follow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(true);
      });
  };

  // to unfollow user
  const unfollowUser = (userId) => {
    fetch("http://localhost:4000/unfollow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(false);
      });
  };

  const isCurrentUser = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser?._id === userid;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user data and posts
      const userRes = await fetch(`http://localhost:4000/user/${userid}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      });

      if (!userRes.ok) {
        throw new Error(`Failed to fetch user data: ${userRes.status}`);
      }

      const userData = await userRes.json();
      console.log('User data:', userData);
      setUser(userData.user);
      setPosts(userData.post || []);
      
      if (userData.user.followers?.includes(JSON.parse(localStorage.getItem("user"))._id)) {
        setIsFollow(true);
      }

      // Fetch user's videos with correct endpoint
      try {
      const videosRes = await fetch(`http://localhost:4000/video/user/${userid}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      });

        if (!videosRes.ok) {
          if (videosRes.status === 404) {
            console.log('No videos found for user');
            setVideos([]);
          } else {
            throw new Error(`Failed to fetch videos: ${videosRes.status}`);
          }
        } else {
      const videosData = await videosRes.json();
      console.log('User videos:', videosData);
          setVideos(Array.isArray(videosData) ? videosData : []);
        }
      } catch (videoErr) {
        console.error('Error fetching videos:', videoErr);
        setVideos([]);
        // Don't throw here, we still want to show the user profile even if videos fail
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUser(null);
      setPosts([]);
      setVideos([]);
      toast.error('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userid]);

  const handleVideoUpdate = () => {
    fetchUserData();
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
          <img src={user.Photo ? user.Photo : picLink} alt="" />
        </div>
        {/* profile-data */}
        <div className="pofile-data">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>{user.name}</h1>
            {/* Only show follow button if not viewing your own profile */}
            {!isCurrentUser() && (
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
      {/* {show &&
        <PostDetail item={posts} toggleDetails={toggleDetails} />
      } */}
    </div>
  );
}
