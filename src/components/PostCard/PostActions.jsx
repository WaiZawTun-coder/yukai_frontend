import { useEffect, useRef, useState } from "react";

// icons
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utilities/api";
import { emitPostReact } from "@/utilities/socket";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import SentimentVeryDissatisfiedRoundedIcon from "@mui/icons-material/SentimentVeryDissatisfiedRounded";
import ShareIcon from "@mui/icons-material/Share";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import Button from "../ui/Button";

// need to change the reacton type from emoji to svg icons
const reactionTypes = {
  like: {
    label: "Like",
    icon: <ThumbUpAltRoundedIcon />,
    color: "#3b82f6",
  },
  love: {
    label: "Love",
    icon: <FavoriteRoundedIcon />,
    color: "#ef4444",
  },
  laugh: {
    label: "Haha",
    icon: <EmojiEmotionsRoundedIcon />,
    color: "#f59e0b",
  },
  wow: {
    label: "Wow",
    icon: <EmojiObjectsRoundedIcon />,
    color: "#facc15",
  },
  sad: {
    label: "Sad",
    icon: <SentimentDissatisfiedRoundedIcon />,
    color: "#60a5fa",
  },
  angry: {
    label: "Angry",
    icon: <SentimentVeryDissatisfiedRoundedIcon />,
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
              <Button
                variant="text"
                key={type}
                onClick={() => handleReact(type)}
                className="reaction-emoji"
                style={{
                  color: data.color,
                  transitionDelay: `${index * 50}ms`,
                }}
                aria-label={data.label}
              >
                {data.icon}
              </Button>
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
