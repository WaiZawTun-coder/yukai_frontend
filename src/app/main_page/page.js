"use client";

import React, { useState } from "react";

// MUI ICONS
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";

const main_page = () => {
  // TAB STATE
  const [activeTab, setActiveTab] = useState("forYou");

  // POST STATE
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(300);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  // REUSABLE POST CARD
  const PostCard = ({ username }) => (
    <div className="post-card">
      <div className="post-header">
        <span className="username">{username}</span>
        <span className="follow">follow</span>
      </div>

      <img
        src="/Images/loginphoto2.jpg"
        alt="post"
        className="post-image"
      />

      <div className="post-stats">
        <span className="icon-btn" onClick={handleLike}>
          {liked ? (
            <FavoriteIcon className="icon liked" />
          ) : (
            <FavoriteBorderIcon className="icon" />
          )}
          {likesCount}
        </span>

        <span className="icon-btn">
          <ChatBubbleOutlineIcon className="icon" /> 120
        </span>

        <span className="icon-btn">
          <RepeatIcon className="icon" /> 87
        </span>

        <span className="icon-btn" onClick={handleBookmark}>
          {bookmarked ? (
            <BookmarkIcon className="icon bookmarked" />
          ) : (
            <BookmarkBorderIcon className="icon" />
          )}
          40
        </span>
      </div>

      <input
        type="text"
        placeholder="Write a comment"
        className="comment-input"
      />
    </div>
  );

  return (
    <div className="feed-wrapper">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-tabs">
          <span
            className={activeTab === "forYou" ? "active" : ""}
            onClick={() => setActiveTab("forYou")}
          >
            for you page
          </span>

          <span
            className={activeTab === "friends" ? "active" : ""}
            onClick={() => setActiveTab("friends")}
          >
            following
          </span>
        </div>

        <div className="search-box">
          <SearchIcon className="icon" />
          <input type="search" placeholder="Search..." />
        </div>
      </div>

      {/* POST INPUT */}
      <div className="post-box">
        <div className="post-input">
          <PersonIcon className="icon" />
          <input type="text" placeholder="what's on your mind" />
        </div>

        <div className="post-actions">
          <button>
            <PersonAddAltIcon /> Tag friends
          </button>
          <button>
            <ImageIcon /> Picture/Video
          </button>
        </div>
      </div>

      {/* FEED CONTENT */}
      {activeTab === "forYou" && <PostCard username="Phyoe" />}
      {activeTab === "friends" && <PostCard username="Friend" />}
      {activeTab === "following" && (
        <PostCard username="Following User" />
      )}
    </div>
  );
};

export default main_page;
