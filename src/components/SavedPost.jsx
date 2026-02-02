"use client";

import SocialPost from "@/app/(warpper)/(main)/post/page";
import { useApi } from "@/utilities/api";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "./ui/Modal";

const SavedPost = ({ goBack, savePostList }) => {
  const apiFetch = useApi();

  const [saveListName, setSaveListName] = useState("");
  const [saveListId, setSaveListId] = useState(0);

  const [savedPosts, setSavedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const observerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [curCommentPage, setCurCommentPage] = useState(1);

  /* ---------------- SET LIST INFO ---------------- */

  useEffect(() => {
    if (!savePostList) return;

    setSaveListName(savePostList.name);
    setSaveListId(savePostList.saved_list_id);

    // reset when switching list
    setSavedPosts([]);
    setPage(1);
    setHasMore(true);
  }, [savePostList]);

  /* ---------------- FETCH SAVED POSTS ---------------- */

  const fetchSavedPosts = useCallback(
    async (pageToFetch) => {
      if (!saveListId || isFetching || !hasMore) return;

      setIsFetching(true);

      try {
        const res = await apiFetch(
          `/api/get-saved-posts/${saveListId}?page=${pageToFetch}`
        );

        if (!res?.status) return;

        setHasMore((res.page ?? 1) < (res.totalPages ?? 1));

        setSavedPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.post_id));
          const next = res.data.filter((p) => !existingIds.has(p.post_id));
          return [...prev, ...next];
        });
      } finally {
        setIsFetching(false);
      }
    },
    [apiFetch, saveListId, isFetching, hasMore]
  );

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    if (saveListId) {
      fetchSavedPosts(1);
    }
  }, [saveListId, fetchSavedPosts]);

  /* ---------------- INFINITE SCROLL OBSERVER ---------------- */

  const lastPostRef = useCallback(
    (node) => {
      if (isFetching || !hasMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setPage((prev) => {
              const next = prev + 1;
              fetchSavedPosts(next);
              return next;
            });
          }
        },
        { rootMargin: "200px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetching, hasMore, fetchSavedPosts]
  );

  if (!savePostList) return null;

  return (
    <div className="saved-post-container">
      {/* HEADER */}
      <div className="saved-post-header">
        <button onClick={goBack} className="save-back-button">
          ← Back
        </button>
        <h3>{saveListName ?? "Saved Posts"}</h3>
      </div>

      {/* POSTS */}
      <div className="saved-post-list">
        {savedPosts.map((post, i) => {
          const isLast = i === savedPosts.length - 1;

          return (
            <div
              key={post.post_id}
              ref={isLast ? lastPostRef : null}
              className="profile-post"
            >
              <SocialPost
                paramPost={post}
                isCommentOpen={false}
                handleCommentClick={() => {
                  setModalPost(post);
                  setIsModalOpen(true);
                }}
              />
            </div>
          );
        })}

        {isFetching && (
          <div style={{ textAlign: "center", padding: "12px", opacity: 0.7 }}>
            Loading more...
          </div>
        )}

        {!hasMore && savedPosts.length > 0 && (
          <div style={{ textAlign: "center", padding: "12px", opacity: 0.6 }}>
            No more posts
          </div>
        )}
      </div>

      {/* MODAL */}
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
    </div>
  );
};

export default SavedPost;
