import { useEffect, useRef, useState } from "react";

// icons
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utilities/api";
import { emitPostReact } from "@/utilities/socket";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ShareIcon from "@mui/icons-material/Share";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Button from "../ui/Button";

// need to change the reacton type from emoji to svg icons
const reactionTypes = {
  like: {
    label: "Like",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#3b82f6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h8c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" />
      </svg>
    ),
    color: "#3b82f6",
  },
  love: {
    label: "Love",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#ef4444"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    color: "#ef4444",
  },

  laugh: {
    label: "Haha",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#f59e0b"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M7 10l1-1 1 1m6 0l1-1 1 1"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 15c1.33 1.33 3.33 1.33 4.67 0 1.33 1.33 3.33 1.33 4.67 0"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    color: "#f59e0b",
  },

  wow: {
    label: "Wow",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#facc15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#facc15"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="9" cy="9" r="1.5" fill="#facc15" />
        <circle cx="15" cy="9" r="1.5" fill="#facc15" />
        <circle
          cx="12"
          cy="15"
          r="2.5"
          stroke="#facc15"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    color: "#facc15",
  },

  sad: {
    label: "Sad",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#60a5fa"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#60a5fa"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="9" cy="10" r="1.2" fill="#60a5fa" />
        <circle cx="15" cy="10" r="1.2" fill="#60a5fa" />
        <path
          d="M8 16c1.33-1.33 3.33-1.33 4.67 0 1.33-1.33 3.33-1.33 4.67 0"
          stroke="#60a5fa"
          strokeWidth="2"
          fill="none"
        />
        {/* tear drop */}
        <path
          d="M15.5 13c.83 1.5 1 3 0 4-1-1-1-2-1-3s.17-1.83 1-1zm-7 0c.83 1.5 1 3 0 4-1-1-1-2-1-3s.17-1.83 1-1z"
          fill="#60a5fa"
        />
      </svg>
    ),
    color: "#60a5fa",
  },

  angry: {
    label: "Angry",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#dc2626"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#dc2626"
          strokeWidth="2"
          fill="none"
        />
        {/* squint eyes */}
        <path
          d="M7 10l3-1m7 1l-3-1"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* angry mouth */}
        <path
          d="M9 16c1.33-1 4-.67 6 0"
          stroke="#dc2626"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* brows */}
        <path
          d="M6.5 8l3 1m10-1l-3 1"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#dc2626",
  },
};

export default function PostActions({
  postId,
  likes = 0,
  userReaction = null,
  comments = 0,
  onLike,
  onComment,
  creatorId,
}) {
  const apiFetch = useApi();
  const { user } = useAuth();

  const [currentReaction, setCurrentReaction] = useState(userReaction);
  const [reactionCount, setReactionCount] = useState(likes);
  const [showPicker, setShowPicker] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef(null);

  const LONG_PRESS_MS = 450;

  const handleReact = async (type) => {
    if (currentReaction === type) {
      setCurrentReaction(null);
      setReactionCount((c) => Math.max(0, c - 1));
      onLike?.(postId, null);
    } else {
      setReactionCount((c) => (currentReaction ? c : c + 1));
      setCurrentReaction(type);
      onLike?.(postId, type);

      const payload = {
        type: "react",
        referenceId: postId,
        message: `${user.display_name} ${type} your post`,
        target_user_id: [creatorId],
      };

      if (creatorId === user.user_id) return;

      const notifRes = await apiFetch(`/api/add-notification`, {
        method: "POST",
        body: payload,
      });

      payload.id = notifRes.data.event_id;
      payload.sender_id = user.user_id;
      payload.sender_name = user.user_display_name;
      payload.profile_image = user.profile_image;
      payload.gender = user.gender;
      payload.read = false;

      emitPostReact(payload);
    }
    setShowPicker(false);
  };

  // --- TOUCH HANDLERS ---
  const onTouchStart = (e) => {
    e.stopPropagation();
    const timer = setTimeout(() => setShowPicker(true), LONG_PRESS_MS);
    setPressTimer(timer);
  };

  const onTouchMove = (e) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const onTouchEnd = (e) => {
    e.stopPropagation();
    clearTimeout(pressTimer);
    setPressTimer(null);
    if (!showPicker) handleReact("like"); // tap = like
  };

  // Prevent picker from closing when touching inside
  const stopPropagation = (e) => e.stopPropagation();

  // Close picker on outside touches
  useEffect(() => {
    const closePicker = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("touchstart", closePicker);
    return () => document.removeEventListener("touchstart", closePicker);
  }, []);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post?post_id=${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this post", url: postUrl });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  return (
    <div className="post-actions">
      <div
        className="reaction-button-wrapper"
        onMouseEnter={() => !("ontouchstart" in window) && setShowPicker(true)}
        onMouseLeave={() => !("ontouchstart" in window) && setShowPicker(false)}
      >
        <Button
          variant="outlined"
          className={`reaction-button ${currentReaction ? "active" : ""}`}
          style={
            currentReaction
              ? { "--reaction-color": reactionTypes[currentReaction].color }
              : {}
          }
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="reaction-main action-content">
            {currentReaction
              ? reactionTypes[currentReaction].icon
              : reactionTypes.like.icon}
            {reactionCount}
          </span>
        </Button>

        {showPicker && (
          <div
            className="reaction-picker"
            ref={pickerRef}
            onTouchStart={stopPropagation}
          >
            {Object.entries(reactionTypes).map(([type, data], index) => (
              <button
                variant="text"
                key={type}
                onClick={() => {
                  handleReact(type);
                  setShowPicker(false);
                }}
                className="reaction-emoji"
                style={{
                  color: data.color,
                  transitionDelay: `${index * 50}ms`,
                  padding: "0px",
                  maxWidth: "60px",
                  padding: "0 10px",
                }}
                aria-label={data.label}
              >
                {data.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button variant="outlined" className="comment-button" onClick={onComment}>
        <span className="action-content">
          <ChatBubbleIcon /> {comments}
        </span>
      </Button>

      <Button variant="outlined" className="share-button" onClick={handleShare}>
        {copied ? (
          <span className="action-content">Link Copied</span>
        ) : (
          <span className="action-content">
            <ShareIcon /> Share
          </span>
        )}
      </Button>
    </div>
  );
}
