"use client";
import { useApi } from "@/utilities/api";
import { useEffect, useRef, useState } from "react";

export default function PostMenu({ isOwner, postId, handleDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const apiFetch = useApi();

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

  const handleSave = async () => {
    const res = await apiFetch("/api/save-post", {
      method: "POST",
      body: { post_id: postId, saved_list_id: 1 },
    });

    console.log(res);
  };

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
              <button onClick={handleSave}>Save post</button>
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
