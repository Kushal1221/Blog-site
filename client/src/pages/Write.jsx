import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import client, { createHeaders } from "../axios-config";
import Cookies from "js-cookie";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

function createHeadersImage() {
  const token = Cookies.get("csrftoken");
  return {
    "X-CSRFToken": token,
    "content-type": "multipart/form-data",
  };
}

Quill.register("modules/imageResize", ImageResize);

function Write() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState();
  const state = useLocation().state;
  const [username, setUsername] = useState("");
  const [value, setValue] = useState(state?.content || "");
  const [title, setTitle] = useState(state?.title || "");
  const [cat, setCat] = useState(state?.cat || "");
  const [imageID, setID] = useState();

  const [formData, setFormData] = useState({
    title: "",
    image: null,
  });

  useEffect(() => {
    client
      .get("/api/user")
      .then(function (res) {
        setUsername(res.data.user.user_id);
        setCurrentUser(true);
      })
      .catch(function (error) {
        setCurrentUser(false);
        navigate("/login");
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const upload = async (e) => {
    e.preventDefault();
    // console.log(formData);

    const form_data = new FormData();
    form_data.append("image", formData.image, formData.image.name);
    form_data.append("title", formData.title);

    const url = "api/upload";

    try {
      const response = await client.post(url, form_data, {
        headers: createHeadersImage(),
      });
      setID(response.data.image_id);
      // console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const post = async (e) => {
    e.preventDefault();

    try {
      state
        ? await client.put(
            `/api/create/${state.post_id}`,
            {
              author: username,
              title,
              content: value,
              cat,
              images: formData.image ? imageID : formData.image_id,
            },
            { headers: createHeaders() }
          )
        : await client.post(
            `/api/create`,
            {
              author: username,
              title: title,
              content: value,
              cat: cat,
              images: formData.image ? imageID : "",
            },
            { headers: createHeaders() }
          );
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ header: 1 }, { header: 2 }],
      ["blockquote", "code-block", "image"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }],
      [{ font: ["Times-New-Ro"] }],
      [{ align: [] }],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
  };

  if (currentUser) {
    return (
      <div className="add">
        <div className="content">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="editorContainer" style={{ height: "400px" }}>
            <ReactQuill
              className="editor"
              theme="snow"
              value={value}
              onChange={setValue}
              modules={modules}
            />
          </div>
        </div>

        <div className="menu">
          <div className="item">
            <div className="imageDesc">
              <form onSubmit={upload}>
                <p>
                  <input
                    type="text"
                    placeholder="Image Title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </p>
                <p>
                  <input
                    type="file"
                    id="image"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    required
                    style={{ display: "none" }}
                  />
                  <label htmlFor="image" className="Btn btn-slide">
                    Select Image
                  </label>
                </p>
                <div>
                  {imageID ? (
                    <p style={{ color: "green", fontSize: "20px" }}>
                      image upload successfully!
                    </p>
                  ) : null}
                </div>
                <input
                  type="submit"
                  value="Upload"
                  className="imageUploadBtn btn-slide"
                />
              </form>
            </div>

            <div className="buttons">
              &nbsp;&nbsp;
              <button onClick={post} className="Btn btn-slide btn-active">
                Publish
              </button>
            </div>
          </div>

          <div className="item">
            <h1>Category</h1>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "anime"}
                name="cat"
                value="anime"
                id="anime"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="art">Anime</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "science"}
                name="cat"
                value="science"
                id="science"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="science">Science</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "technology"}
                name="cat"
                value="technology"
                id="technology"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="technology">Technology</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "travel"}
                name="cat"
                value="travel"
                id="travel"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="travel">Travel</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "event"}
                name="cat"
                value="event"
                id="event"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="event">Event</label>
            </div>
            <div className="cat">
              <input
                type="radio"
                checked={cat === "food"}
                name="cat"
                value="food"
                id="food"
                onChange={(e) => setCat(e.target.value)}
              />
              <label htmlFor="food">Food</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Write;
