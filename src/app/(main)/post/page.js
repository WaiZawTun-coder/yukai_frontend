"use client";

import PostCard from "@/components/PostCard/postCard";
import { useKeyboard } from "@/components/postComposer/useKeyboard";
import CommentSkeleton from "@/components/ui/CommentSkeleton";
import Popup from "@/components/ui/Popup";
import PostSkeleton from "@/components/ui/PostSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SocialPost = ({
  paramPost = null,
  isCommentOpen = true,
  handleCommentClick = null,
}) => {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const apiFetch = useApi();
  const { showSnackbar } = useSnackbar();

  const paramPostId = params.get("post_id");

  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(null);

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  const [openPopup, setOpenPopup] = useState(false);
  const [targetPostId, setTargetPostId] = useState(null);

  const observerRef = useRef(null);

  // -------------------------
  // Fetch Post
  // -------------------------
  useEffect(() => {
    if (!paramPostId && !paramPost) {
      router.replace("/");
      return;
    }

    const getPost = async () => {
      setIsLoading(true);
      const postId = paramPostId ? paramPostId : paramPost.post_id;
      try {
        const res = await apiFetch(`/api/get-post?post_id=${postId}`);
        if (!res.status) {
          showSnackbar({
            title: "Error",
            message: res.message,
            variant: "error",
          });
          return;
        }
        setPost(res.data[0]);
      } catch (err) {
        showSnackbar({
          title: "Error",
          message: err?.message || "Unable to fetch post",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!paramPost) {
      getPost();
    } else {
      setPost(paramPost);
      setIsLoading(false);
    }
  }, [apiFetch, router, showSnackbar, paramPost, paramPostId]);

  // -------------------------
  // Fetch Comments (by page)
  // -------------------------
  useEffect(() => {
    if ((!paramPostId && !paramPost) || !hasMore) return;

    const postId = paramPostId ? paramPostId : paramPost.post_id;

    const getComments = async () => {
      if (!isCommentOpen) return;
      setIsFetchingComments(true);
      try {
        const res = await apiFetch(`/api/get-comment/${postId}?page=${page}`, {
          method: "GET",
        });

        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.comment_id));

          const newOnes = res.data.filter((c) => !ids.has(c.comment_id));

          return [...prev, ...newOnes];
        });
        setHasMore(res.total_page > res.page);
      } catch (err) {
        showSnackbar({
          title: "Failed",
          message: "Unable to load comments",
          variant: "error",
        });
      } finally {
        setIsFetchingComments(false);
      }
    };

    getComments();
  }, [page, hasMore, apiFetch, showSnackbar, paramPostId, paramPost]);

  // -------------------------------
  // Handle reactions
  // -------------------------------
  const handleReact = async (postId, reactType = "like") => {
    try {
      await apiFetch("/api/react-post", {
        method: "POST",
        body: {
          reaction: reactType,
          post_id: postId,
          user_id: user.user_id,
        },
      });
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  // -------------------------
  // Infinite Scroll Observer
  // -------------------------
  const lastCommentRef = useCallback(
    (node) => {
      if (isFetchingComments) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingComments, hasMore]
  );

  // -------------------------
  // Add Comment
  // -------------------------
  const handleComment = async () => {
    if (!comment.trim()) return;

    setCommenting(true);
    try {
      const res = await apiFetch("/api/comment-post", {
        method: "POST",
        body: { post_id: postId, comment },
      });

      if (!res.status) {
        showSnackbar({
          title: "Comment failed",
          message: res.message || "",
          variant: "error",
        });
        return;
      }

      showSnackbar({
        title: "Comment posted",
        message: "",
        variant: "success",
      });

      setComments((prev) => [res.comment, ...prev]);
      setComment("");
      setPost((prev) => ({ ...prev, comment_count: prev.comment_count + 1 }));
    } catch (err) {
      showSnackbar({
        title: "Error",
        message: "Unable to post comment",
        variant: "error",
      });
    } finally {
      setCommenting(false);
    }
  };

  // -------------------------
  // Delete Post
  // -------------------------
  const handleDelete = async () => {
    if (!targetPostId) return;

    try {
      const res = await apiFetch(`/api/delete-post?post_id=${targetPostId}`, {
        method: "DELETE",
      });

      if (res.status) {
        showSnackbar({
          title: "Success",
          message: res.message,
          variant: "success",
        });
        router.replace("/");
      } else {
        showSnackbar({
          title: "Error",
          message: res.message,
          variant: "error",
        });
      }
    } catch (err) {
      showSnackbar({
        title: "Error",
        message: "Delete failed",
        variant: "error",
      });
    } finally {
      setOpenPopup(false);
      setTargetPostId(null);
    }
  };

  // -------------------------
  // Time Formatter
  // -------------------------
  const formatDate = (dateStr) => {
    const d = new Date(dateStr.replace(" ", "T"));
    const diff = (Date.now() - d) / 1000;

    if (diff < 86400) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -Math.floor(diff / 3600),
        "hour"
      );
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useKeyboard({
    enabled: open,
    onSubmit: handleComment,
  });

  // -------------------------
  // Render
  // -------------------------
  if (isLoading)
    return (
      <div style={{ width: "95%" }}>
        <PostSkeleton />
        <CommentSkeleton count={4} />
      </div>
    );

  return (
    <div className="main-wrapper">
      <div className="post-scrollable">
        <PostCard
          user={{
            username: post?.creator.username,
            name: post?.creator?.display_name,
            avatar:
              post?.creator?.profile_image !== ""
                ? `/api/images?url=${post?.creator?.profile_image}`
                : `/Images/default-profiles/${post?.creator?.gender}.jpg`,
          }}
          createdAt={post?.created_at}
          content={post?.content}
          images={post?.attachments}
          likes={post?.react_count}
          comments={post?.comment_count}
          postId={post?.post_id}
          userReaction={post?.reaction ?? null}
          onComment={() => {
            handleCommentClick?.();
          }}
          onLike={handleReact}
          handleDelete={() => {
            setOpenPopup(true);
            setTargetPostId(post?.post_id);
          }}
        />

        {isCommentOpen && (
          <div className="comments-list">
            {comments.length === 0 && !isFetchingComments && (
              <div className="no-comments">No comments yet</div>
            )}

            {comments.map((c, index) => {
              const isLast = index === comments.length - 1;

              return (
                <div
                  key={`${c.comment_id}-${index}`}
                  className="comment-item"
                  ref={isLast ? lastCommentRef : null}
                >
                  <Image
                    className="comment-avatar"
                    src={
                      c.creator?.profile_image
                        ? `/api/images?url=${c.creator.profile_image}`
                        : `/Images/default-profiles/${c.creator?.gender}.jpg`
                    }
                    alt={c.creator?.display_name}
                    width={34}
                    height={34}
                    onClick={() => {
                      if (pathname != `/${c.creator.username}`)
                        router.replace(`/${c.creator.username}`);
                    }}
                    style={{ cursor: "pointer" }}
                  />

                  <div className="comment-body">
                    <div className="comment-header">
                      <span
                        className="comment-name"
                        onClick={() => {
                          if (pathname != `/${user.username}`)
                            router.replace(`/${user.username}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {c.creator?.display_name}
                      </span>
                      <span className="comment-time">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="comment-text">{c.comment}</p>
                  </div>
                </div>
              );
            })}

            {isFetchingComments && <CommentSkeleton count={3} />}
          </div>
        )}
      </div>

      {/* COMMENT INPUT */}
      <div className="comment-input-wrapper">
        <Image
          src={
            `/api/images?url=${user.profile_image}` ??
            `/Images/default-profiles/${user.gender}.jpg`
          }
          alt="profile"
          width={34}
          height={34}
          style={{ borderRadius: "50%", overflow: "hidden" }}
        />
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="comment-submit" onClick={handleComment}>
          {commenting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* DELETE POPUP */}
      <Popup
        isOpen={openPopup}
        onClose={() => {
          setTargetPostId(null);
          setOpenPopup(false);
        }}
        title="Are you sure you want to delete this post?"
        footer={
          <div className="popup-actions">
            <button
              className="popup-btn popup-btn-cancel"
              onClick={() => {
                setTargetPostId(null);
                setOpenPopup(false);
              }}
            >
              Cancel
            </button>

            <button
              className="popup-btn popup-btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        }
      >
        <p>This action cannot be undone.</p>
      </Popup>
    </div>
  );
};

export default SocialPost;
