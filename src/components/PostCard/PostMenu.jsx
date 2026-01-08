"use client";
import { useEffect, useRef, useState } from "react";

export default function PostMenu({ isOwner, postId, handleDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="post-menu" ref={ref}>
      <button
        className="post-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Post options"
      >
        ⋯
      </button>

      {open && (
        <div className="post-menu-dropdown">
          {isOwner ? (
            <>
              <button>Edit post</button>
              <button>Change privacy</button>
              <button className="danger" onClick={handleDelete}>
                Delete post
              </button>
            </>
          ) : (
            <>
              <button>Save post</button>
              <button>Hide post</button>
              <button>Report post</button>
            </>
          )}
          <button>View edit history</button>
        </div>
      )}
    </div>
  );
}
