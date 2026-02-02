"use client";

import { useEffect, useState } from "react";
import PostActions from "./PostActions";
import PostImages from "./PostImages";
import PostMenu from "./PostMenu";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";

function PrivacyIcon({ type }) {
  switch (type) {
    case "friends":
      return (
        <span className="privacy-icon" title="Friends">
          <PeopleIcon fontSize="small" />
        </span>
      );

    case "private":
      return (
        <span className="privacy-icon" title="Only me">
          <LockIcon fontSize="small" />
        </span>
      );

    default:
      return (
        <span className="privacy-icon" title="Public">
          <PublicIcon fontSize="small" />
        </span>
      );
  }
}

export default function PostCard({
  user = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150",
    gender: "male",
    username: "",
  },
  content = "",
  images = [],
  taggedUsers = [],
  createdAt = "Just now",
  privacy = "public",
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onShare,
  postId,
  userReaction = null,
  handleDelete,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const { user: authUser } = useAuth();

  function parseLocalDateTime(dateStr) {
    // "2026-01-21 13:45:10" → [2026,01,21,13,45,10]
    const [datePart, timePart = "00:00:00"] = dateStr.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);

    // Month is 0-based in JS
    return new Date(y, m - 1, d, hh, mm, ss);
  }

  useEffect(() => {
    function formatPostDate(dateStr) {
      const d = parseLocalDateTime(dateStr); // ✅ local time
      const diffSeconds = (Date.now() - d.getTime()) / 1000;

      if (diffSeconds < 60) return "Just now";

      if (diffSeconds < 3600) {
        const mins = Math.floor(diffSeconds / 60);
        return `${mins}m ago`;
      }

      if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        return `${hours}h ago`;
      }

      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    const update = () => setTime(formatPostDate(createdAt));
    update();

    // Optional: auto refresh every minute
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <div className="post-card">
      {/* HEADER */}
      <div className="post-header">
        <Image
          src={user.avatar}
          alt={user.name}
          width={44}
          height={44}
          onClick={() => {
            if (pathname != `/${user.username}`)
              router.replace(`/${user.username}`);
          }}
          style={{
            objectFit: "cover",
          }}
        />
        <div className="post-user">
          <div className="user-meta">
            <h4
              className="post-author"
              onClick={() => {
                if (pathname != `/${user.username}`)
                  router.replace(`/${user.username}`);
              }}
            >
              {user.name}
            </h4>

            {/* TAG FRIENDS */}
            {taggedUsers?.length > 0 && (
              <div className="post-tags">
                <span className="with-text">with</span>

                {taggedUsers.map((u, index) => (
                  <span
                    key={u.user_id}
                    className="tag-user"
                    onClick={() => router.push(`/${u.username}`)}
                  >
                    {u.display_name}
                    {index < taggedUsers.length - 1 && ","}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="post-meta">
            <span className="post-time">{time}</span>
            <PrivacyIcon type={privacy} />
          </div>
        </div>
        <PostMenu
          isOwner={user.username == authUser.username}
          postId={postId}
          handleDelete={handleDelete}
        />
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
