"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function TagFriendsModal({
  open,
  friends = [],
  selected = [],
  onClose,
  onChange,
}) {
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!open) setKeyword("");
  }, [open]);

  if (!open) return null;

  const toggleFriend = (friend) => {
    const exists = selected.find((f) => f.user_id === friend.user_id);

    if (exists) {
      onChange(selected.filter((f) => f.user_id !== friend.user_id));
    } else {
      onChange([...selected, friend]);
    }
  };

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="tag-backdrop">
      <div className="tag-modal">
        <header>
          <h3>Tag Friends</h3>
          <button onClick={onClose}>✕</button>
        </header>

        {/* Selected pills */}
        {selected.length > 0 && (
          <div className="selected-pills">
            {selected.map((f) => (
              <span key={f.user_id} className="pill">
                {f.display_name}
                <button onClick={() => toggleFriend(f)}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <input
          className="search-input"
          placeholder="Search friends..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        {/* Friend list */}
        <div className="friend-list">
          {filtered.map((friend) => {
            const active = selected.some((f) => f.user_id === friend.user_id);

            return (
              <div
                key={friend.user_id}
                className={`tag-friend-item ${active ? "active" : ""}`}
                onClick={() => toggleFriend(friend)}
              >
                <Image
                  src={
                    friend.profile_image
                      ? `/api/images?url=${friend.profile_image}`
                      : `/Images/default-profiles/${friend.gender}.jpg`
                  }
                  width={36}
                  height={36}
                  alt=""
                />
                <span>{friend.display_name}</span>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty">No friends found</div>
          )}
        </div>

        <footer>
          <button className="secondary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
