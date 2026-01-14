import React from "react";

const EditPost = () => {
  return (
    <div className="editpost">
      <div className="header">
        <span className="close">✕</span>
        <h3>Edit post</h3>
       
      </div>

      <div className="user">
        <img src="/Images/profile.jpg" alt="profile" className="avatar" />
        <span className="username">Kaung Thant</span>
      </div>

      <div className="options">
        <button>👥 People</button>
        <button>📍 Location</button>
        <button>😊 Feeling/activity</button>
      </div>

      <textarea
        className="caption"
        placeholder="What's on your mind?"
        
      />

      <div className="image-box">
        <img src="/Images/post.jpg" alt="post" />
        <button className="delete">🗑</button>
      </div>

      <div className="footer">
        <span className="privacy">🔒 Only me</span>
        <button className="save active">Save</button>
      </div>
    </div>
  );
};

export default EditPost;
