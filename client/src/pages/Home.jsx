import React from "react";
import { useEffect, useState } from "react";
import client from "../axios-config";
import "../style/style.scss";
import { Link, useLocation } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.get(`api/posts/${cat}`);
        const postsData = res.data;

        const postsWithImages = await Promise.all(
          postsData.map(async (post) => {
            const imageId = post.images;
            if (imageId) {
              // Fetch image URL based on image_id
              const imageRes = await client.get(
                `/api/get_image_url/${imageId}`
              );
              const imageUrl = imageRes.data.url;
              post.images = imageUrl;
            }
            return post;
          })
        );
        setPosts(postsWithImages);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };

  return (
    <div className="home">
      <div className="posts">
        {posts.map((post) => (
          <div className="post" key={post.post_id}>
            <div className="img">
              <img src={`http://127.0.0.1:8000${post.images}`} alt="" />
            </div>
            <div className="content">
              <Link className="link" to={`/post/${post.post_id}`}>
                <h1>{post.title}</h1>
              </Link>
              <p>{getText(post.content).slice(0, 200) + "..."}</p>
              <Link className="link" to={`/post/${post.post_id}`}>
                <button>Read More</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
