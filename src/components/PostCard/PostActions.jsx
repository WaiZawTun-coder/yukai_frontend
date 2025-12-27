import { useState } from "react";

export default function PostActions({
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onShare,
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likes);

  const toggleLike = () => {
    setLiked((v) => !v);
    setCount((c) => (liked ? c - 1 : c + 1));
    onLike?.();
  };

  return (
    <div className="post-actions">
      <button
        onClick={toggleLike}
        className={`post-action ${liked ? "active" : ""}`}
      >
        ❤️ {count}
      </button>

      <button onClick={onComment} className="post-action">
        💬 {comments}
      </button>

      <button onClick={onShare} className="post-action">
        🔗 Share
      </button>
    </div>
  );
}
