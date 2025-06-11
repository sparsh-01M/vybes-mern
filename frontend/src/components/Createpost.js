import React, { useState, useEffect } from "react";
import "./Createpost.css";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import config from "../config/config";

export default function Createpost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState("")
  const [url, setUrl] = useState("")
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Toast functions
  const notifyA = (msg) => toast.error(msg)
  const notifyB = (msg) => toast.success(msg)

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("Full user data from localStorage:", userData);
    
    // Fetch fresh user data to get the latest profile picture
    fetch(`${config.BACKEND_URL}/user/${userData._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Fetched user data:", result.user);
        setUser(result.user); // Use the fresh user data
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
        setUser(userData); // Fallback to localStorage data if fetch fails
      });
  }, []);

  useEffect(() => {

    // saving post to mongodb
    if (url) {

      fetch(`${config.BACKEND_URL}/createPost`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({
          body,
          pic: url
        })
      }).then(res => res.json())
        .then(data => {
          if (data.error) {
            notifyA(data.error)
          } else {
            notifyB("Successfully Posted")
            navigate("/")
          }
        })
        .catch(err => console.log(err))
    }

  }, [url])


  // posting image to cloudinary
  const postDetails = () => {

    console.log(body, image)
    const data = new FormData()
    data.append("file", image)
    data.append("upload_preset", "insta-clone")
    data.append("cloud_name", "cantacloud2")
    fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
      method: "post",
      body: data
    }).then(res => res.json())
      .then(data => setUrl(data.url))
      .catch(err => console.log(err))
    console.log(url)

  }


  const loadfile = (event) => {
    var output = document.getElementById("output");
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
      URL.revokeObjectURL(output.src); // free memory
    };
  };
  return (
    <div className="createPost">
      {/* //header */}
      <div className="post-header">
        <h4 style={{ margin: "3px auto" }}>Create New Post</h4>
        <button id="post-btn" onClick={() => { postDetails() }}>Share</button>
      </div>
      {/* image preview */}
      <div className="main-div">
        <img
          id="output"
          src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            loadfile(event);
            setImage(event.target.files[0])
          }}
        />
      </div>
      {/* details */}
      <div className="details">
        <div className="card-header">
          <div className="card-pic">
            <img
              src={user?.Photo || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
              alt={user?.name}
              onError={(e) => {
                console.log("Error loading profile picture. User data:", user);
                console.log("Attempted photo URL:", user?.Photo);
                console.log("Error details:", e);
                e.target.src = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
              }}
              style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <h5>{user?.name || "User"}</h5>
        </div>
        <textarea value={body} onChange={(e) => {
          setBody(e.target.value)
        }} type="text" placeholder="Write a caption...."></textarea>
      </div>
    </div>
  );
}
