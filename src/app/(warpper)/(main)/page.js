"use client";

import PostCard from "@/components/PostCard/postCard";
import PostComposer from "@/components/postComposer/PostComposer";
import CommentSkeleton from "@/components/ui/CommentSkeleton";
import Modal from "@/components/ui/Modal";
import Popup from "@/components/ui/Popup";
import PostSkeleton from "@/components/ui/PostSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SocialPost from "./post/page";

const { default: TopBar } = require("@/components/TopBar");

const Home = () => {
  const apiFetch = useApi();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const params = useSearchParams();

  // -------------------------------
  // State
  // -------------------------------
  const [activeTab, setActiveTab] = useState("recommend");
  const [data, setData] = useState({
    recommend: [],
    following: [],
    friends: [],
  });
  const [curPage, setCurPage] = useState({
    recommend: 1,
    following: 1,
    friends: 1,
  });
  const [hasMore, setHasMore] = useState({
    recommend: true,
    following: true,
    friends: true,
  });
  const [isFetchPosts, setIsFetchPosts] = useState(false);
  const [isFetchComments, setIsFetchComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [curCommentPage, setCurCommentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);

  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");

  const [openPopup, setOpenPopup] = useState(false);
  const [targetPostId, setTargetPostId] = useState(null);

  const observerRef = useRef(null);

  const commentObserverRef = useRef(null);

  // -------------------------------
  // Infinite scroll observer
  // -------------------------------
  const lastPostRef = useCallback(
    (node) => {
      if (!activeTab || isFetchPosts || !hasMore[activeTab]) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsFetchPosts(true);
          }
        },
        {
          root: null,
          rootMargin: "200px",
          threshold: 0,
        },
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetchPosts, hasMore, activeTab],
  );

  const lastCommentRef = useCallback(
    (node) => {
      if (isFetchComments || !hasMoreComments) return;

      if (commentObserverRef.current) commentObserverRef.current.disconnect();

      commentObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsFetchComments(true);
          }
        },
        { root: null, rootMargin: "56px", threshold: 0 },
      );

      if (node) commentObserverRef.current.observe(node);
    },
    [isFetchComments, hasMoreComments],
  );

  // -------------------------------
  // Fetch posts
  // -------------------------------
  useEffect(() => {
    if (!activeTab || !isFetchPosts || !hasMore[activeTab]) return;

    const fetchPosts = async () => {
      let apiUrl = "";

      const type = params.get("type");

      if (type === "recommend" || activeTab === "recommend") {
        apiUrl = "/api/get-posts?page=" + curPage.recommend;
      } else if (type === "friends" || activeTab === "friends") {
        apiUrl = "/api/get-friends-posts?page=" + curPage.friends;
      } else if (type === "following" || activeTab === "following") {
        apiUrl = "/api/get-following-post?page=" + curPage.following;
      }

      try {
        const res = await apiFetch(apiUrl);

        const newPosts = res.data ?? [];
        const page = res.page ?? 1;
        const totalPages = res.totalPages ?? 1;

        setData((prev) => {
          const oldPostIds = new Set(
            prev[activeTab].map((post) => post.post_id),
          );

          const filterNewPosts = newPosts.filter(
            (post) => !oldPostIds.has(post.post_id),
          );

          return {
            ...prev,
            [activeTab]: [...prev[activeTab], ...filterNewPosts],
          };
        });

        setCurPage((prev) => ({
          ...prev,
          [activeTab]: page + 1,
        }));

        setHasMore((prev) => ({
          ...prev,
          [activeTab]: page < totalPages,
        }));
      } catch (error) {
        console.error("Fetch posts error:", error);
      } finally {
        setLoading(false);
        setIsFetchPosts(false);
      }
    };

    fetchPosts();
  }, [activeTab, isFetchPosts, apiFetch, curPage, hasMore, params]);

  // -------------------------------
  // Fetch first page only if data is empty
  // -------------------------------
  useEffect(() => {
    if (data[activeTab])
      if (data[activeTab].length === 0 && hasMore[activeTab]) {
        setIsFetchPosts(true);
      }
  }, [activeTab, data, hasMore]);

  useEffect(() => {
    if (!modalPost) {
      setHasMoreComments(true);
      return;
    }

    const getComment = async () => {
      if (!hasMoreComments) return;

      setIsFetchComments(true);
      try {
        const res = await apiFetch(
          `/api/get-comment/${modalPost.post_id}?page=${curCommentPage}`,
          {
            method: "GET",
          },
        );

        setComments((prev) => [...prev, ...res.data]);
        setHasMoreComments(res.total_page > res.page);
        setCurCommentPage((prev) => prev + 1);
      } catch (err) {
        showSnackbar({
          title: "Failed",
          message: "Unable to load comments",
          variant: "error",
        });
      } finally {
        setIsFetchComments(false);
      }
    };

    getComment();
  }, [apiFetch, curCommentPage, hasMoreComments, modalPost, showSnackbar]);

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
  // -------------------------------
  // Handle reactions
  // -------------------------------
  const handleComment = async (postId, creatorId) => {
    setCommenting(true);
    try {
      const res = await apiFetch("/api/comment-post", {
        method: "POST",
        body: { post_id: postId, comment: comment },
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
        title: "Comment success",
        message: "",
        variant: "success",
      });
      setComments((prev) => [res.comment, ...prev]);
      setComment("");
    } catch (err) {
    } finally {
      setCommenting(false);
    }
  };

  // -------------------------------
  // Handle reactions
  // -------------------------------
  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;

    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy link:", err));
  };

  // -------------------------------
  // Time helper
  // ------------------------------
  function formatDate(dateStr) {
    const d = new Date(dateStr.replace(" ", "T"));
    const diff = (Date.now() - d) / 1000;

    if (diff < 86400) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -Math.floor(diff / 3600),
        "hour",
      );
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const updatePosts = (post) => {
    setData((prev) => {
      return { ...prev, [activeTab]: [post, ...prev[activeTab]] };
    });
  };

  const handleDelete = async () => {
    if (!targetPostId) return;

    const res = await apiFetch(`/api/delete-post?post_id=${targetPostId}`, {
      method: "DELETE",
    });

    if (res.status) {
      showSnackbar({
        title: "Success",
        message: res.message,
        variant: "success",
      });
      setData((prev) => {
        const updatePosts = prev[activeTab].filter(
          (post) => post.post_id != targetPostId,
        );

        return { ...prev, [activeTab]: updatePosts };
      });
      setOpenPopup(false);
      setTargetPostId(null);
    } else {
      showSnackbar({
        title: "Error",
        message: "Post Delete Failed - " + res.message,
        variant: "error",
      });
    }
  };

  // -------------------------------
  // Render
  // -------------------------------

  return (
    <div className="main-container">
      <TopBar setData={setActiveTab} />
      <div style={{ height: "32px" }}></div>
      <PostComposer handleCreate={updatePosts} />

      <div className="post-container">
        {loading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
        {data[activeTab] &&
          data[activeTab].map((post, index) => {
            const isLast = index === data[activeTab].length - 1;
            return (
              <div
                ref={isLast ? lastPostRef : null}
                key={post?.post_id ?? index}
              >
                <PostCard
                  user={{
                    userId: post?.creator?.id,
                    username: post?.creator?.username,
                    name: post?.creator?.display_name ?? "",
                    avatar:
                      post?.creator?.profile_image !== ""
                        ? `/api/images?url=${post?.creator?.profile_image}`
                        : `/Images/default-profiles/${post?.creator?.gender}.jpg`,
                  }}
                  createdAt={post?.created_at}
                  privacy={post.privacy}
                  taggedUsers={post?.tagged_users}
                  content={post?.content}
                  images={post?.attachments}
                  likes={post?.react_count}
                  comments={post?.comment_count}
                  onLike={handleReact}
                  onComment={() => {
                    if (!isModalOpen) {
                      setIsModalOpen(true);
                      setModalPost(post);
                    }
                  }}
                  onShare={() => handleShare(post?.post_id)}
                  postId={post?.post_id}
                  userReaction={post?.reaction ?? null}
                  handleDelete={() => {
                    setOpenPopup(true);
                    setTargetPostId(post?.post_id);
                  }}
                  isSaved={post?.isSaved}
                />
              </div>
            );
          })}
        {isFetchPosts && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
      </div>

      {!hasMore[activeTab] && (
        <div className="no-more-posts">No more posts...</div>
      )}

      {modalPost && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalPost(null);
            setComments([]);
            setCurCommentPage(1);
          }}
          title={modalPost.creator.display_name + "'s Post"}
        >
          <div className="post-modal-main">
            <SocialPost paramPost={modalPost} />
          </div>
        </Modal>
      )}

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
              className="popup-btn popup-btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="popup-btn popup-btn-cancel"
              onClick={() => {
                setTargetPostId(null);
                setOpenPopup(false);
              }}
            >
              Cancel
            </button>
          </div>
        }
      >
        <p>This action cannot be undone.</p>
      </Popup>
    </div>
  );
};

export default Home;
