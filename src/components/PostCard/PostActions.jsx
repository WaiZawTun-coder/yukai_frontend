import { useEffect, useState } from "react";

// icons
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import SentimentVeryDissatisfiedRoundedIcon from "@mui/icons-material/SentimentVeryDissatisfiedRounded";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ShareIcon from "@mui/icons-material/Share";

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
}) {
  const [currentReaction, setCurrentReaction] = useState(userReaction);
  const [reactionCount, setReactionCount] = useState(likes);
  const [showPicker, setShowPicker] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleReact = (type) => {
    if (currentReaction === type) {
      setCurrentReaction(null);
      setReactionCount((c) => Math.max(0, c - 1));
      onLike?.(postId, null);
    } else {
      setReactionCount((c) => (currentReaction ? c : c + 1));
      setCurrentReaction(type);
      onLike?.(postId, type);
    }
    setShowPicker(false);
  };

  const LONG_PRESS_MS = 450;

  const onTouchStart = () => {
    setPressTimer(
      setTimeout(() => {
        setShowPicker(true);
      }, LONG_PRESS_MS)
    );
  };

  const onTouchEnd = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const onClick = () => {
    handleReact("like");
  };

  useEffect(() => {
    const close = () => setShowPicker(false);
    document.addEventListener("touchstart", close);
    return () => document.removeEventListener("touchstart", close);
  }, []);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          url: postUrl,
        });
      } catch (err) {
        console.error("Share cancelled or failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <div className="post-actions">
      <div
        className="reaction-button-wrapper"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
      >
        <button
          className={`reaction-button ${currentReaction ? "active" : ""}`}
          style={
            currentReaction
              ? { "--reaction-color": reactionTypes[currentReaction].color }
              : {}
          }
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onClick}
        >
          <span className="reaction-main action-content">
            {currentReaction
              ? reactionTypes[currentReaction].icon
              : reactionTypes.like.icon}
            {reactionCount}
          </span>
        </button>

        {showPicker && (
          <div
            className="reaction-picker"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {Object.entries(reactionTypes).map(([type, data], index) => (
              <button
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
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="comment-button" onClick={onComment}>
        <span className="action-content">
          <ChatBubbleIcon /> {comments}
        </span>
      </button>

      <button
        className="share-button"
        onClick={() => {
          handleShare();
        }}
      >
        {copied ? (
          <span className="action-content">Link Copied</span>
        ) : (
          <span className="action-content">
            <ShareIcon />
            Share
          </span>
        )}
      </button>
    </div>
  );
}
