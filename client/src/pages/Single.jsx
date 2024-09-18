import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useEffect, useState } from "react";
import Edit from "../assets/edit.png";
import Delete from "../assets/delete.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/style.scss";
import client, { createHeaders } from "../axios-config";
import moment from "moment";


// require('dotenv').config();


function Single() {
  const [comment, setComment] = useState("");
  const [allcomments, setAllComments] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [currentUserID, setCurrentUserID] = useState();
  const [post, setPost] = useState({});
  const [summarizedtext, setsummarizedtext] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const postId = location.pathname.split("/")[2];

  useEffect(() => {
    client
      .get("/api/user")
      .then(function (res) {
        setCurrentUser(res.data.user.username);
        setCurrentUserID(res.data.user.user_id);
      })
      .catch(function (error) {
        setCurrentUser(false);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.get(`api/post/${postId}/comments`);
        setAllComments(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.get(`api/posts/${postId}`);
        const postData = res.data;
        const imageId = postData.images;

        if (imageId) {
          // Fetch image URL based on image_id
          const imageRes = await client.get(`/api/get_image_url/${imageId}`);
          const imageUrl = imageRes.data.url;
          // Add imageUrl to postData
          postData.images = imageUrl;
        }

        setPost(postData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId]);

  const handleDelete = async () => {
    try {
      if (post.author === currentUser) {
        await client.delete(`api/posts/${postId}`, {
          headers: createHeaders(),
        });
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setComment("");
  };
  const handleSubmit = async () => {
    try {
      const response = await client.post(
        "api/comment/",
        {
          user_id: currentUserID,
          post_id: postId,
          text: comment,
        },
        { headers: createHeaders() }
      );
      setAllComments((prevComments) => [...prevComments, response.data]);
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };

  const commentdelete = async (commentId) => {
    try {
      await client.delete(`api/comment/${commentId}`, {
        headers: createHeaders(),
      });
      setAllComments((prevComments) =>
        prevComments.filter((comment) => comment.comment_id !== commentId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };
  const before_summarise = getText(post.content);

  //api key
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_APP_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); 

  const HandleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const prompt = "summarize the following content: "+ before_summarise;
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    setsummarizedtext(text);
    setLoading(false);
  };

  return (
    <div className="single">
      <div className="content">
        <div className="post-title">
          <h1>{post.title}</h1>
        </div>
        <img src={`http://127.0.0.1:8000${post.images}`} alt="" />
        <div className="user">
          {/* <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYxsG3Ac8-CCLG3PzEvZXAfVoQxmjHleJqjg&usqp=CAU"
            alt=""
          /> */}
          <div className="info">
            <span>{post.author}</span>
            <p>{moment(post.created_at).fromNow()}</p>
          </div>

          <div className="edit">
            {post.author === currentUser ? (
              <Link to={`/write?edit=2`} state={post}>
                <img src={Edit} alt="Edit" />
              </Link>
            ) : null}

            {post.author === currentUser ? (
              <img onClick={handleDelete} src={Delete} alt="Delete" />
            ) : null}
          </div>

          <button type="button" onClick={HandleSubmit}>
            {loading ? "loading..." : "Summarize"}
          </button>
        </div>

        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="summary">
          {summarizedtext ? <h2>Summary:</h2> : null}
          <p>{summarizedtext}</p>
        </div>

        {currentUser ? (
          <div className="comment-area">
            <input
              className="comment-inp"
              type="textarea"
              placeholder="leave a comment"
              onChange={(e) => setComment(e.target.value)}
              value={comment}
            ></input>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        ) : (
          <div className="comment-area">
            <p>please log in to view & write comment</p>
            <Link to="/login">
              <p>login</p>
            </Link>
          </div>
        )}
        {allcomments.map((comments) => (
          <div className="commentContainer" key={comments.comment_id}>
            <div>
              <p className="writer">{comments.user_id}</p>
              <p>{comments.text}</p>
            </div>

            <div className="commentedit">
              {currentUser == comments.user_id ? (
                <button
                  className="delete-btn"
                  onClick={() => commentdelete(comments.comment_id)}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Single;
