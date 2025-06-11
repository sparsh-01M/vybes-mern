import React, { useEffect, useState, useContext } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import config from "../config/config";

export default function Home() {
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
  const navigate = useNavigate();
  const { userLogin, setUserLogin } = useContext(LoginContext)
  const [data, setData] = useState([]);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    if (!localStorage.getItem("jwt")) {
      navigate("./signup");
    }

    // Fetching all posts
    fetch(`${config.BACKEND_URL}/allposts`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        // Handle both possible response structures
        if (Array.isArray(result)) {
        setData(result);
        } else if (result && result.posts) {
          setData(result.posts);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setData([]);
      });
  }, []);

  // to show and hide comments
  const toggleComment = (posts) => {
    if (show) {
      setShow(false);
    } else {
      // Fetch fresh post data with populated comments
      fetch(`${config.BACKEND_URL}/post/${posts._id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log("Fetched post details for comments:", {
            postId: result._id,
            comments: result.comments?.map(comment => ({
              id: comment._id,
              postedBy: comment.postedBy ? {
                id: comment.postedBy._id,
                name: comment.postedBy.name,
                hasPhoto: !!comment.postedBy.Photo,
                photoUrl: comment.postedBy.Photo
              } : null
            }))
          });
          setItem(result);
          setShow(true);
        })
        .catch((err) => {
          console.error("Error fetching post details:", err);
          notifyA("Error loading comments");
        });
    }
  };

  const likePost = (id) => {
    fetch(`${config.BACKEND_URL}/like`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
      });
  };
  const unlikePost = (id) => {
    fetch(`${config.BACKEND_URL}/unlike`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
      });
  };

  // function to make comment
  const makeComment = (text, id) => {
    if (!text || text.trim() === "") {
      notifyA("Comment cannot be empty");
      return;
    }

    fetch(`${config.BACKEND_URL}/comment`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
        setComment("");
        notifyB("Comment posted");
      });
  };

  return (
    <div className="home">
      {/* card */}
      {data && data.length > 0 ? (
        data.map((posts) => {
        return (
            <div className="card" key={posts._id}>
            {/* card header */}
            <div className="card-header">
              <div className="card-pic">
                {posts.postedBy._id === JSON.parse(localStorage.getItem("user"))?._id ? (
                  <Link to="/profile">
                    <img src={posts.postedBy.Photo ? posts.postedBy.Photo : picLink} alt="" />
                  </Link>
                ) : (
                  <Link to={`/profile/${posts.postedBy._id}`}>
                    <img src={posts.postedBy.Photo ? posts.postedBy.Photo : picLink} alt="" />
                  </Link>
                )}
              </div>
              {posts.postedBy._id === JSON.parse(localStorage.getItem("user"))?._id ? (
                <Link to="/profile">
                  <h5>{posts.postedBy.name}</h5>
                </Link>
              ) : (
                <Link to={`/profile/${posts.postedBy._id}`}>
                  <h5>{posts.postedBy.name}</h5>
                </Link>
              )}
            </div>
            {/* card image */}
            <div className="card-image">
              <img src={posts.photo} alt="" />
            </div>

            {/* card content */}
            <div className="card-content">
              <div className="like-container">
                {posts.likes.includes(
                  JSON.parse(localStorage.getItem("user"))._id
                ) ? (
                  <span
                    className="material-symbols-outlined material-symbols-outlined-red"
                    onClick={() => {
                      unlikePost(posts._id);
                    }}
                  >
                    favorite
                  </span>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    onClick={() => {
                      likePost(posts._id);
                    }}
                  >
                    favorite
                  </span>
                )}
                <span className="likes-count">{posts.likes.length}</span>
              </div>

              <div className="caption-container">
                <div className="caption-section">
                  <p className="caption">{posts.body}</p>
                </div>
                <p
                  className="view-comments"
                  onClick={() => {
                    toggleComment(posts);
                  }}
                >
                  View all comments
                </p>
              </div>
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
                  makeComment(comment, posts._id);
                }}
              >
                Post
              </button>
            </div>
          </div>
        );
        })
      ) : (
        <div className="no-posts">
          <p>No posts available. Be the first to create a post!</p>
        </div>
      )}

      {/* show Comment */}
      {show && (
        <div className="showComment">
          <div className="container">
            <div className="postPic">
              <img src={item.photo} alt="" />
            </div>
            <div className="details">
              {/* card header */}
              <div
                className="card-header"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                <div className="card-pic">
                  <img
                    src={item.postedBy?.Photo || picLink}
                    alt={item.postedBy?.name || "User"}
                    onError={(e) => {
                      console.log("Error loading profile picture:", {
                        user: item.postedBy,
                        attemptedUrl: item.postedBy?.Photo,
                        error: e
                      });
                      e.target.src = picLink;
                    }}
                    style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      objectFit: "cover",
                      border: "1px solid #eee"
                    }}
                  />
                </div>
                <h5>{item.postedBy?.name || "User"}</h5>
              </div>

              {/* commentSection */}
              <div
                className="comment-section"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                {item.comments?.map((comment) => {
                  return (
                    <div className="comment-item" key={comment._id}>
                      <div className="comment-pic">
                        <img
                          src={comment.postedBy?.Photo || picLink}
                          alt={comment.postedBy?.name || "User"}
                          onError={(e) => {
                            console.log("Error loading commenter profile picture:", {
                              user: comment.postedBy,
                              attemptedUrl: comment.postedBy?.Photo,
                              error: e
                            });
                            e.target.src = picLink;
                          }}
                          style={{ 
                            width: "24px", 
                            height: "24px", 
                            borderRadius: "50%", 
                            objectFit: "cover",
                            border: "1px solid #eee"
                          }}
                        />
                      </div>
                      <p className="comm">
                        <span className="commenter" style={{ fontWeight: "bolder" }}>
                          {comment.postedBy?.name || "User"}{" "}
                        </span>
                        <span className="commentText">{comment.comment}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* card content */}
              <div className="card-content">
                <p>{item.likes?.length || 0} Likes</p>
                <p>{item.body}</p>
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
                    makeComment(comment, item._id);
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
              setShow(false);
            }}
          >
            <span className="material-symbols-outlined material-symbols-outlined-comment">
              Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
