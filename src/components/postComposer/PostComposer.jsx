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
import TagFriendsModal from "../TagFriendsModal";
import { emitPostCreate } from "@/utilities/socket";

const PRIVACY_OPTIONS = [
  { label: "Public", value: "public" },
  { label: "Friends", value: "friends" },
  { label: "Only Me", value: "private" },
];

export default function PostComposer({ handleCreate, isEditing = false, editPostId, onClose, isOpen = false }) {
  const apiFetch = useApi();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  const [open, setOpen] = useState(isOpen);
  const [postId, setPostId] = useState(0);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draftLoadedRef = useRef(false);
  const editPostLoadedRef = useRef(false);

  // tag friends
  const [showTagModal, setShowTagModal] = useState(false);
  const [friends, setFriends] = useState([]); // full friend list
  const [taggedFriends, setTaggedFriends] = useState([]); // selected

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
      setText("");
      setImages([]);
      setFiles([]);
      setTaggedFriends([]);
      setPostId(0);
      onClose();
      draftLoadedRef.current = false;

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
      images.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  /* -------------------- submit -------------------- */

  async function handleSubmit(isDraft = false) {
    if ((!text || !text.trim()) && images.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("content", text);
    formData.append("privacy", privacy);
    formData.append("is_draft", isDraft ? "1" : "0");
    if (postId != 0) {
      formData.append("post_id", postId);
    }

    files.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      const data = await apiFetch("/api/create-post", {
        method: "POST",
        body: formData,
      });

      if (!data.status) {
        showSnackbar({ title: "Post creation failed", message: data.message, variant: "error" });
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

      if (!isDraft) {
        handleCreate(data.data[0]);

        const res = await apiFetch("/api/get-followers");

        const followers = res.data;

        const followerIds = followers.map((f) => f.user_id);

        const payload = {
          type: "post",
          referenceId: data.data[0].post_id,
          message: `${user.display_name} added new post.`,
          target_user_id: followerIds,
        };

        await apiFetch(`/api/add-notification`, {
          method: "POST",
          body: payload,
        });

        emitPostCreate();
      }
    } catch (err) {
      showSnackbar({ title: err.message || "Network error", message: err.error || "Please try again", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -------------------- UPDATE DEFAULT AUDIENCE -------------------- */
  useEffect(() => {
    const update = () => {
      setPrivacy(user.default_audience);
    };

    update();
  }, [user]);

  useEffect(() => {
    async function loadFriends() {
      try {
        const res = await apiFetch("/api/get-friends");
        if (res.status) {
          setFriends(res.data);
        }
      } catch { }
    }

    loadFriends();
  }, []);

  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await apiFetch("/api/get-draft-post");

        if (!res.status || !res.data || res.data.length === 0) {
          draftLoadedRef.current = true;
          return;
        }

        const draft = res.data[0];

        setText(draft.content || "");
        setPrivacy(draft.privacy || "public");
        setPostId(draft.post_id);

        if (draft.attachments?.length > 0) {
          const imageUrls = draft.attachments.map(
            (file) => `/api/images?url=${file.file_path}`
          );
          setImages(imageUrls);
        }

        if (draft.tagged_friends) {
          setTaggedFriends(draft.tagged_friends);
        }

        showSnackbar({
          title: "Draft restored",
          variant: "info",
        });

      } catch (err) {
        console.error("Failed to load draft", err);
      } finally {
        draftLoadedRef.current = true;
      }
    }

    if (open && !draftLoadedRef.current && !isEditing) {
      loadDraft();
    }
  }, [apiFetch, open]);


  useEffect(() => {
    async function loadOldPost() {
      try {
        const res = await apiFetch(`/api/get-post?post_id=${editPostId}`);

        if (!res.status || !res.data || res.data.length === 0) {
          draftLoadedRef.current = true;
          return;
        }

        const draft = res.data[0];

        setText(draft.content || "");
        setPrivacy(draft.privacy || "public");
        setPostId(draft.post_id);

        if (draft.attachments?.length > 0) {
          const imageUrls = draft.attachments.map(
            (file) => `/api/images?url=${file.file_path}`
          );
          setImages(imageUrls);
        }

        if (draft.tagged_friends) {
          setTaggedFriends(draft.tagged_friends);
        }

      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        draftLoadedRef.current = true;
      }
    }

    if (open && !editPostLoadedRef.current && isEditing) {
      loadOldPost();
    }
  }, [apiFetch, open]);



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
            style={{ cursor: "pointer", objectFit: "cover" }}
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
              removable={!isEditing}
              images={images}
              onRemove={(i) => {
                URL.revokeObjectURL(images[i]);
                setImages((prev) => prev.filter((_, x) => x !== i));
                setFiles((prev) => prev.filter((_, x) => x !== i));
              }}
            />
          )}

          {taggedFriends?.length > 0 && (
            <div className="selected-pills">
              {taggedFriends.map((f) => (
                <span key={f.user_id} className="pill">
                  {f.display_name}
                  <button
                    onClick={() => {
                      setTaggedFriends((prev) =>
                        prev.filter((fl) => fl.user_id !== f.user_id)
                      );
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="post-actions">
            <div className="action-buttons">
              <button type="button" onClick={() => setShowTagModal(true)}>
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
                color="secondary"
              />
            </div>

            {(open || images.length > 0 || text) && (
              <div className="action-buttons">
                <button
                  className="ghost"
                  onClick={() => {
                    unlockScroll();
                    setOpen(false);
                    setText("");
                    setImages([]);
                    setFiles([]);
                    setTaggedFriends([]);
                    setPostId(0);
                    onClose();
                    draftLoadedRef.current = false;

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
          setText("");
          setImages([]);
          setFiles([]);
          setTaggedFriends([]);
          setPostId(0);
          draftLoadedRef.current = false;
          onClose();

          if (textareaRef.current) textareaRef.current.blur();
        }}
      />

      <TagFriendsModal
        open={showTagModal}
        friends={friends}
        selected={taggedFriends}
        onChange={setTaggedFriends}
        onClose={() => setShowTagModal(false)}
      />
    </>
  );
}
