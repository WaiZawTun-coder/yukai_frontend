"use client";

import PersonIcon from "@mui/icons-material/Person";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ImageIcon from "@mui/icons-material/Image";
import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "@/context/SnackbarContext";

const CreatePost = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [context, setContext] = useState({ text: "", image: null, tag: [] });

  const textareaRef = (useRef < HTMLTextAreaElement) | (null > null);
  const wrapperRef = (useRef < HTMLDivElement) | (null > null);

  const { showSnackbar } = useSnackbar();

  // auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [context.text, isCreating, textareaRef]);

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        isCreating &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        if (!context.text && !context.image && !context.tag.length) {
          setIsCreating(false);
        }
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isCreating, context, wrapperRef]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={`post-box ${isCreating ? "active" : ""}`}
      >
        <PersonIcon className="profile-icon" />

        <div className="action">
          <div className="post-input">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              onFocus={() => setIsCreating(true)}
              value={context.text}
              onChange={(e) =>
                setContext((prev) => ({ ...prev, text: e.target.value }))
              }
            />
          </div>

          <div className="post-actions">
            <div
              className={`action-buttons action-update ${
                isCreating ? "active" : ""
              }`}
            >
              <button>
                <PersonAddAltIcon />
                <span>Tag friends</span>
              </button>

              <button>
                <ImageIcon />
                <span>Photo / Video</span>
              </button>
            </div>

            {isCreating && (
              <div className="action-buttons">
                <button onClick={() => setIsCreating(false)} className="ghost">
                  Cancel
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    showSnackbar({
                      title: "Posted",
                      message: "Your post was published",
                      variant: "success",
                    })
                  }
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`composer-backdrop ${isCreating ? "active" : ""}`} />
    </>
  );
};

export default CreatePost;
