"use client";

import { useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import ImagePreview from "./ImagePreview";
import { useDragDrop } from "./useDrag&Drop";
import { useKeyboard } from "./useKeyboard";

// icons
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Select from "../ui/Select";
import { useApi } from "@/utilities/api";
import { useSnackbar } from "@/context/SnackbarContext";

const PRIVACY_OPTIONS = [
  { label: "Public", value: "public" },
  { label: "Friends", value: "friends" },
  { label: "Only Me", value: "private" },
];

export default function PostComposer() {
  const apiFetch = useApi();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [isDraft, setIsDraft] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // keyboard shortcuts
  useKeyboard({
    enabled: open,
    onSubmit: handleSubmit,
    onCancel: () => {
      setOpen(false);
      const textarea = textareaRef.current;

      if (!textarea) return;

      textarea.blur();
    },
  });

  // drag & drop
  useDragDrop(wrapperRef, (files) => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  });

  // autosize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [text]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  async function handleSubmit() {
    if (!text && images.length === 0) return; // prevent empty post

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("creator_id", user.user_id);
    formData.append("content", text);
    formData.append("privacy", privacy); // public/friends/private
    formData.append("is_draft", isDraft ? "1" : "0"); // draft state

    // Append actual File objects, not just URLs
    const fileInputs = wrapperRef.current.querySelector('input[type="file"]');
    if (fileInputs?.files.length > 0) {
      Array.from(fileInputs.files).forEach((file) => {
        formData.append("attachments[]", file); // backend expects attachments[]
      });
    }

    const data = await apiFetch("/api/create-post", {
      method: "POST",
      body: formData,
    });
    if (!data.status)
      showSnackbar("Post creation failed", res.message, "error");
    else {
      showSnackbar("Post creation successful", "", "success");
      setText("");
      setImages([]);
      setOpen(false);
    }
  }

  return (
    <>
      <div ref={wrapperRef} className={`post-box ${open ? "active" : ""}`}>
        <div className="profile-icon">
          <Image
            src={
              `/api/images?url=${user.profile_image}` ??
              `/Images/default-profiles/${user.gender}.jpg`
            }
            alt="profile"
            width={48}
            height={48}
          />
          <div className="post-input">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={text}
              onFocus={() => setOpen(true)}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="action">
          {images.length > 0 && (
            <ImagePreview
              images={images}
              onRemove={(i) =>
                setImages((prev) => prev.filter((_, x) => x !== i))
              }
            />
          )}

          <div className="post-actions">
            <div className="action-buttons">
              {/* <button onClick={() => setShowEmoji((v) => !v)}>😀 Emoji</button> */}
              <button>
                <LocalOfferOutlinedIcon />
                Tag Friends
              </button>

              <label>
                <AddPhotoAlternateOutlinedIcon />
                Photo
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const urls = files.map((f) => URL.createObjectURL(f));
                    setImages((p) => [...p, ...urls]);
                  }}
                />
              </label>

              <Select
                options={PRIVACY_OPTIONS}
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                size="small"
              />
            </div>

            {open ||
              (images.length > 0 && (
                <div className="action-buttons">
                  <button className="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="ghost"
                    onClick={async () => {
                      setIsDraft(true);
                      await handleSubmit();
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    className="primary"
                    onClick={async () => await handleSubmit()}
                  >
                    Post
                  </button>
                </div>
              ))}
          </div>

          {showEmoji && (
            <EmojiPicker
              onSelect={(emoji) => {
                setText((t) => t + emoji);
                setShowEmoji(false);
              }}
            />
          )}
        </div>
      </div>

      <div
        className={`composer-backdrop ${open ? "active" : ""}`}
        onClick={() => {
          setOpen(false);
          const textarea = textareaRef.current;

          if (!textarea) return;

          textarea.blur();
        }}
      />
    </>
  );
}
