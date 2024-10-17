import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import profilePhoto from "../assets/profile.jpeg";
import "../style/style.scss";
import client, { createHeaders } from "../axios-config";

function Profile() {
  const [username, setUsername] = useState(null);
  const [useremail, setUseremail] = useState(null);
  const [posts, setPosts] = useState([]);
  // const [postId, setpostId] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await client.get("/api/user");
        const userData = userRes.data.user;
        setUsername(userData.username);
        setUseremail(userData.email);

        // Fetch user posts
        const postRes = await client.get(
          `/api/posts/byUser/${userData.user_id}/`
        );
        setPosts(postRes.data);
        // setpostId(postRes.data.map((post) => post.post_id));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (postIdToDelete) => {
    try {
      await client.delete(`api/posts/${postIdToDelete}/`, {
        headers: createHeaders(),
      });
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postIdToDelete)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="profile">
      <div className="user-info">
        <h1>{username}</h1>
        <h4>{useremail}</h4>
      </div>
      <h2>Blogs</h2>
      <div className="blogs">
        {posts.map((post) => (
          <div key={post.post_id} className="post-pro">
            <div className="post-title">
              <Link className="link" to={`/post/${post.post_id}`}>
                <h3>{post.title}</h3>
              </Link>
            </div>
            <div className="btns">
              <Link to={`/write?edit=2`} state={post}>
                <button className="edit-btn">Edit</button>
              </Link>
              <button
                onClick={() => handleDelete(post.post_id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
