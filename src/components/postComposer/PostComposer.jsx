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
import { useRouter } from "next/navigation";

const PRIVACY_OPTIONS = [
  { label: "Public", value: "public" },
  { label: "Friends", value: "friends" },
  { label: "Only Me", value: "private" },
];

export default function PostComposer({ handleCreate }) {
  const apiFetch = useApi();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------- helpers -------------------- */

  const lockScroll = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.overflow = "hidden";
      mainContent.style.maxHeight = "90vh";
    }
  };

  const unlockScroll = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.overflow = "";
      mainContent.style.maxHeight = "fit-content";
    }
  };

  /* -------------------- keyboard shortcuts -------------------- */

  useKeyboard({
    enabled: open,
    onSubmit: () => handleSubmit(false),
    onCancel: () => {
      unlockScroll();
      setOpen(false);
      if (textareaRef.current) textareaRef.current.blur();
    },
  });

  /* -------------------- drag & drop -------------------- */

  useDragDrop(wrapperRef, (droppedFiles) => {
    setFiles((prev) => [...prev, ...droppedFiles]);

    const urls = droppedFiles.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  });

  /* -------------------- autosize textarea -------------------- */

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [text]);

  /* -------------------- revoke object URLs -------------------- */

  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  /* -------------------- submit -------------------- */

  async function handleSubmit(isDraft = false) {
    if ((!text || !text.trim()) && images.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("creator_id", user.user_id);
    formData.append("content", text);
    formData.append("privacy", privacy);
    formData.append("is_draft", isDraft ? "1" : "0");

    files.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      const data = await apiFetch("/api/create-post", {
        method: "POST",
        body: formData,
      });

      if (!data.status) {
        showSnackbar("Post creation failed", data.message, "error");
        return;
      }

      showSnackbar({
        title: "Post creation successful",
        variant: "success",
      });

      setText("");
      setImages([]);
      setFiles([]);
      setOpen(false);
      unlockScroll();

      handleCreate(data.data[0]);
    } catch (err) {
      showSnackbar("Network error", "Please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <>
      <div ref={wrapperRef} className={`post-box ${open ? "active" : ""}`}>
        <div className="profile-icon">
          <Image
            src={
              user.profile_image
                ? `/api/images?url=${user.profile_image}`
                : `/Images/default-profiles/${user.gender}.jpg`
            }
            alt="profile"
            width={48}
            height={48}
            onClick={() => router.replace(`/${user.username}`)}
            style={{ cursor: "pointer" }}
          />

          <div className="post-input">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={text}
              onFocus={() => {
                lockScroll();
                setOpen(true);
              }}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="action">
          {images.length > 0 && (
            <ImagePreview
              images={images}
              onRemove={(i) => {
                URL.revokeObjectURL(images[i]);
                setImages((prev) => prev.filter((_, x) => x !== i));
                setFiles((prev) => prev.filter((_, x) => x !== i));
              }}
            />
          )}

          <div className="post-actions">
            <div className="action-buttons">
              <button type="button">
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
                    const selected = Array.from(e.target.files || []);

                    setFiles((prev) => [...prev, ...selected]);

                    const urls = selected.map((f) => URL.createObjectURL(f));
                    setImages((p) => [...p, ...urls]);

                    e.target.value = "";
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

            {(open || images.length > 0 || text) && (
              <div className="action-buttons">
                <button
                  className="ghost"
                  onClick={() => {
                    unlockScroll();
                    setOpen(false);
                    if (textareaRef.current) textareaRef.current.blur();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  className="ghost"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  Save Draft
                </button>

                <button
                  className="primary"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            )}
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

      {/* Backdrop */}
      <div
        className={`composer-backdrop ${open ? "active" : ""}`}
        onClick={() => {
          unlockScroll();
          setOpen(false);
          if (textareaRef.current) textareaRef.current.blur();
        }}
      />
    </>
  );
}
