import React, { useEffect, useState } from "react";
import "./PostDetail.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../config/config";

export default function PostDetail({ item, toggleDetails, isProfilePage = false, activeTab = 'posts' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [postData, setPostData] = useState(item);
  const [comment, setComment] = useState("");

  // Debug logs
  useEffect(() => {
    console.log("PostDetail mounted with item:", {
      postId: item?._id,
      postedBy: item?.postedBy ? {
        id: item.postedBy._id,
        name: item.postedBy.name,
        hasPhoto: !!item.postedBy.Photo,
        photoUrl: item.postedBy.Photo
      } : null
    });
  }, [item]);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  // Fetch post details if postedBy is not fully populated
  useEffect(() => {
    if (item?._id && (!item.postedBy?.Photo || !item.postedBy?.name)) {
      console.log("Fetching post details for post:", item._id);
      fetch(`${config.BACKEND_URL}/post/${item._id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log("Fetched post details:", {
            postId: result._id,
            postedBy: result.postedBy ? {
              id: result.postedBy._id,
              name: result.postedBy.name,
              hasPhoto: !!result.postedBy.Photo,
              photoUrl: result.postedBy.Photo
            } : null
          });
          setPostData(result);
        })
        .catch((err) => {
          console.error("Error fetching post details:", err);
        });
    } else {
      setPostData(item);
    }
  }, [item]);

  const removePost = (postId) => {
    if (window.confirm("Do you really want to delete this post ?")) {
      fetch(`${config.BACKEND_URL}/deletePost/${postId}`, {
        method: "delete",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          toggleDetails();
          navigate("/");
          notifyB(result.message);
        });
    }
  };

  const handleProfileClick = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    if (postData.postedBy?._id === currentUser?._id) {
      // If it's the current user's profile, just close the modal
      // The Link component will handle the navigation
      toggleDetails();
    } else {
      // If it's another user's profile
      navigate(`/profile/${postData.postedBy?._id}`);
      toggleDetails();
    }
  };

  const handleCommenterClick = (commenterId) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    if (commenterId === currentUser?._id) {
      // If clicking on your own comment, just close the modal
      // The Link component will handle the navigation
      toggleDetails();
    } else {
      // If clicking on another user's comment
      navigate(`/profile/${commenterId}`);
      toggleDetails();
    }
  };

  const makeComment = (comment, postId) => {
    // Implement the logic to make a comment
    console.log("Making comment:", comment, "for post:", postId);
  };

  return (
    <div className="showComment">
      <div className="container">
        <div className="postPic">
          <img src={postData.photo} alt="" />
        </div>
        <div className="details">
          {/* card header */}
          <div
            className="card-header"
            style={{ borderBottom: "1px solid #00000029" }}
          >
            <div 
              className="card-pic"
              style={{ cursor: 'pointer' }}
            >
              {postData.postedBy?._id === JSON.parse(localStorage.getItem("user"))?._id ? (
                <Link to="/profile" onClick={toggleDetails} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img
                    src={postData.postedBy?.Photo || defaultProfilePic}
                    alt={postData.postedBy?.name || "User"}
                    onError={(e) => {
                      console.log("Error loading profile picture:", {
                        user: postData.postedBy,
                        attemptedUrl: postData.postedBy?.Photo,
                        error: e
                      });
                      e.target.src = defaultProfilePic;
                    }}
                    style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      objectFit: "cover",
                      border: "1px solid #eee"
                    }}
                  />
                </Link>
              ) : (
                <img
                  src={postData.postedBy?.Photo || defaultProfilePic}
                  alt={postData.postedBy?.name || "User"}
                  onClick={handleProfileClick}
                  onError={(e) => {
                    console.log("Error loading profile picture:", {
                      user: postData.postedBy,
                      attemptedUrl: postData.postedBy?.Photo,
                      error: e
                    });
                    e.target.src = defaultProfilePic;
                  }}
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    objectFit: "cover",
                    border: "1px solid #eee"
                  }}
                />
              )}
            </div>
            {postData.postedBy?._id === JSON.parse(localStorage.getItem("user"))?._id ? (
              <Link to="/profile" onClick={toggleDetails} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h5 style={{ cursor: 'pointer' }}>
                  {postData.postedBy?.name || "User"}
                </h5>
              </Link>
            ) : (
              <h5 
                onClick={handleProfileClick}
                style={{ cursor: 'pointer' }}
              >
                {postData.postedBy?.name || "User"}
              </h5>
            )}
            {postData.postedBy?._id === JSON.parse(localStorage.getItem("user"))?._id && (
              <div
                className="deletePost"
                onClick={() => {
                  removePost(postData._id);
                }}
              >
                <span className="material-symbols-outlined">delete</span>
              </div>
            )}
          </div>

          {/* commentSection */}
          <div
            className="comment-section"
            style={{ borderBottom: "1px solid #00000029" }}
          >
            {postData.comments?.map((comment) => (
              <div className="comment-item" key={comment._id}>
                <div 
                  className="comment-pic"
                  style={{ cursor: 'pointer' }}
                >
                  {comment.postedBy?._id === JSON.parse(localStorage.getItem("user"))?._id ? (
                    <Link to="/profile" onClick={toggleDetails} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img
                        src={comment.postedBy?.Photo || defaultProfilePic}
                        alt={comment.postedBy?.name || "User"}
                        onError={(e) => {
                          console.log("Error loading commenter profile picture:", {
                            user: comment.postedBy,
                            attemptedUrl: comment.postedBy?.Photo,
                            error: e
                          });
                          e.target.src = defaultProfilePic;
                        }}
                        style={{ 
                          width: "24px", 
                          height: "24px", 
                          borderRadius: "50%", 
                          objectFit: "cover",
                          border: "1px solid #eee"
                        }}
                      />
                    </Link>
                  ) : (
                    <img
                      src={comment.postedBy?.Photo || defaultProfilePic}
                      alt={comment.postedBy?.name || "User"}
                      onClick={() => handleCommenterClick(comment.postedBy?._id)}
                      onError={(e) => {
                        console.log("Error loading commenter profile picture:", {
                          user: comment.postedBy,
                          attemptedUrl: comment.postedBy?.Photo,
                          error: e
                        });
                        e.target.src = defaultProfilePic;
                      }}
                      style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        border: "1px solid #eee"
                      }}
                    />
                  )}
                </div>
                <p className="comm">
                  {comment.postedBy?._id === JSON.parse(localStorage.getItem("user"))?._id ? (
                    <Link to="/profile" onClick={toggleDetails} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span 
                        className="commenter" 
                        style={{ fontWeight: "bolder", cursor: 'pointer' }}
                      >
                        {comment.postedBy?.name || "User"}{" "}
                      </span>
                    </Link>
                  ) : (
                    <span 
                      className="commenter" 
                      style={{ fontWeight: "bolder", cursor: 'pointer' }}
                      onClick={() => handleCommenterClick(comment.postedBy?._id)}
                    >
                      {comment.postedBy?.name || "User"}{" "}
                    </span>
                  )}
                  <span className="commentText">{comment.comment}</span>
                </p>
              </div>
            ))}
          </div>

          {/* card content */}
          <div className="card-content">
            <p>{postData.likes?.length || 0}</p>
            <p>{postData.body}</p>
          </div>

          {/* add Comment */}
          <div className="add-comment">
            <span className="material-symbols-outlined">mood</span>
            <input
              type="text"
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}
            />
            <button
              className="comment"
              onClick={() => {
                makeComment(comment, postData._id);
                setComment("");
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      <div
        className="close-comment"
        onClick={() => {
          toggleDetails();
        }}
      >
        <span className="material-symbols-outlined material-symbols-outlined-comment">
          Close
        </span>
      </div>
    </div>
  );
}
