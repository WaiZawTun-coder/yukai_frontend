"use client";

import { useEffect, useState } from "react";
import PostActions from "./PostActions";
import PostImages from "./PostImages";
import PostMenu from "./PostMenu";

function PrivacyIcon({ type }) {
  switch (type) {
    case "friends":
      return (
        <span className="privacy-icon" title="Friends">
          👥
        </span>
      );

    case "private":
      return (
        <span className="privacy-icon" title="Only me">
          🔒
        </span>
      );

    default:
      return (
        <span className="privacy-icon" title="Public">
          🌍
        </span>
      );
  }
}

export default function PostCard({
  user = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150",
  },
  content = "",
  images = [],
  createdAt = "Just now",
  privacy = "public",
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onShare,
  postId,
  userReaction = null,
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    function formatPostDate(dateStr) {
      const d = new Date(dateStr.replace(" ", "T"));
      const diff = (Date.now() - d) / 1000;

      if (diff < 86400) {
        return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
          -Math.floor(diff / 3600),
          "hour"
        );
      }

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    const update = () => setTime(formatPostDate(createdAt));
    update();
  }, [createdAt]);

  return (
    <div className="post-card">
      {/* HEADER */}
      <div className="post-header">
        <img src={user.avatar} alt="avatar" />
        <div className="post-user">
          <h4 className="post-author">{user.name}</h4>
          <div className="post-meta">
            <span className="post-time">{time}</span>
            <PrivacyIcon type={privacy} />
          </div>
        </div>
        <PostMenu isOwner={true} postId={postId} />
      </div>
      <hr className="post-divider"></hr>

      {/* CONTENT */}
      {content && <p className="post-content">{content}</p>}

      {/* IMAGES */}
      {images.length > 0 && <PostImages images={images} />}

      {/* ACTIONS */}
      <PostActions
        postId={postId}
        likes={likes}
        comments={comments}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
        userReaction={userReaction}
      />
    </div>
  );
}
