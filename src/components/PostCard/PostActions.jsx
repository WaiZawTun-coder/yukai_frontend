import { useState } from "react";

export default function PostActions({
  postId,
  likes = 0,
  userReaction = null,
  comments = 0,
  onLike,
  onComment,
  onShare,
}) {
  const [currentReaction, setCurrentReaction] = useState(userReaction);
  const [reactionCount, setReactionCount] = useState(likes);
  const [showPicker, setShowPicker] = useState(false);

  // need to change the reacton type from emoji to svg icons
  const reactionTypes = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😡",
  };

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

  return (
    <div className="post-actions">
      <div
        className="reaction-button-wrapper"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
      >
        <button
          className={`reaction-button ${currentReaction ? "active" : ""}`}
        >
          {currentReaction ? reactionTypes[currentReaction] : "👍"}{" "}
          {reactionCount}
        </button>

        {showPicker && (
          <div className="reaction-picker">
            {Object.entries(reactionTypes).map(([type, emoji], index) => (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className="reaction-emoji"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="comment-button" onClick={onComment}>
        💬 {comments}
      </button>

      <button className="share-button" onClick={onShare}>
        🔗 Share
      </button>
    </div>
  );
}
