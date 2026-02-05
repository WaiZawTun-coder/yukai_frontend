"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useApi } from "@/utilities/api";
import { useRouter, useSearchParams } from "next/navigation";
import PostCard from "@/components/PostCard/postCard";
import PeopleGrid from "@/components/PeopleGrid";
import Modal from "@/components/ui/Modal";
import { useSnackbar } from "@/context/SnackbarContext";
import SocialPost from "../post/page";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { emitPostComment } from "@/utilities/socket";

const TABS = [
  { id: 1, name: "All", value: "all" },
  { id: 2, name: "Users", value: "users" },
  { id: 3, name: "Posts", value: "posts" },
];

const SearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiFetch = useApi();
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();

  const typeParam = searchParams.get("type") || "all";
  const queryParam = searchParams.get("q") || "";

  const [keyword, setKeyword] = useState(queryParam);
  const [debouncedKeyword, setDebouncedKeyword] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(typeParam);

  const [users, setUsers] = useState({ page: 1, total_pages: 1, data: [] });
  const [posts, setPosts] = useState({ page: 1, total_pages: 1, data: [] });

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [curCommentPage, setCurCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const wrapperRef = useRef(null);
  const postObserverRef = useRef(null);

  /* -------------------- Debounce input -------------------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  /* --------------------- Scroll state --------------------- */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleScroll = () => setIsScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------- Sync URL type -------------------- */
  useEffect(() => {
    if (typeParam !== activeTab) {
      setActiveTab(typeParam);
    }
  }, [typeParam]);

  /* -------------------- Build URL -------------------- */
  const buildSearchUrl = (page) => {
    const params = new URLSearchParams();
    params.set("keyword", debouncedKeyword);
    params.set("page", page);
    if (activeTab !== "all") {
      params.set("type", activeTab);
    }
    return `/api/search?${params.toString()}`;
  };

  /* -------------------- Fetch search results -------------------- */
  const fetchResults = useCallback(
    async (page = 1) => {
      if (!debouncedKeyword) return;

      if (activeTab === "all" || activeTab === "users") {
        setLoadingUsers(true);
      }
      if (activeTab === "all" || activeTab === "posts") {
        setLoadingPosts(true);
      }

      try {
        const res = await apiFetch(buildSearchUrl(page));

        if (res.status) {
          const { users: usersRes, posts: postsRes } = res.data;

          // USERS
          if (activeTab === "all" || activeTab === "users") {
            setUsers((prev) => ({
              page: usersRes.page,
              total_pages: usersRes.total_pages,
              data:
                page === 1 ? usersRes.data : [...prev.data, ...usersRes.data],
            }));
          }

          // POSTS
          if (activeTab === "all" || activeTab === "posts") {
            setPosts((prev) => ({
              page: postsRes.page,
              total_pages: postsRes.total_pages,
              data:
                page === 1 ? postsRes.data : [...prev.data, ...postsRes.data],
            }));
          }
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoadingUsers(false);
        setLoadingPosts(false);
      }
    },
    [debouncedKeyword, activeTab, apiFetch]
  );

  /* -------------------- Refetch on keyword or tab change -------------------- */
  useEffect(() => {
    if (!debouncedKeyword) {
      setUsers({ page: 1, total_pages: 1, data: [] });
      setPosts({ page: 1, total_pages: 1, data: [] });
      return;
    }

    // reset before fetch
    setUsers({ page: 1, total_pages: 1, data: [] });
    setPosts({ page: 1, total_pages: 1, data: [] });

    fetchResults(1);

    router.replace(
      `?q=${encodeURIComponent(debouncedKeyword)}&type=${activeTab}`,
      { scroll: false }
    );
  }, [debouncedKeyword, activeTab, fetchResults]);

  /* -------------------- Infinite scroll -------------------- */
  const loadMoreUsers = () => {
    if (!loadingUsers && users.page < users.total_pages) {
      fetchResults(users.page + 1);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (!loadingPosts && posts.page < posts.total_pages) {
      fetchResults(posts.page + 1);
    }
  }, [loadingPosts, posts.page, posts.total_pages, fetchResults]);

  useEffect(() => {
    if (activeTab === "users") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMorePosts();
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    if (postObserverRef.current) observer.observe(postObserverRef.current);
    return () => observer.disconnect();
  }, [loadMorePosts, activeTab]);

  /* -------------------- Tab change -------------------- */
  const handleTabChange = (tab) => {
    setActiveTab(tab.value);
  };

  /* -------------------- Post handlers -------------------- */
  const handleReact = async (postId, reactType = "like") => {
    try {
      await apiFetch("/api/react-post", {
        method: "POST",
        body: { reaction: reactType, post_id: postId },
      });

      setPosts((prev) => ({
        ...prev,
        data: prev.data.map((p) =>
          p.post_id === postId
            ? {
                ...p,
                reaction: reactType,
                react_count:
                  reactType === p.reaction
                    ? p.react_count
                    : (p.react_count || 0) + 1,
              }
            : p
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, commentText, creatorId) => {
    try {
      const res = await apiFetch("/api/comment-post", {
        method: "POST",
        body: { post_id: postId, comment: commentText },
      });

      if (!res.status) {
        showSnackbar({
          title: "Comment failed",
          message: res.message || "",
          variant: "error",
        });
        return;
      }

      setPosts((prev) => ({
        ...prev,
        data: prev.data.map((p) =>
          p.post_id === postId
            ? { ...p, comment_count: (p.comment_count || 0) + 1 }
            : p
        ),
      }));

      const payload = {
        type: "comment",
        referenceId: postId,
        message: `${user.display_name} commented on your post`,
        target_user_id: [creatorId],
      };

      if (creatorId == user.user_id) return;

      const notifRes = await apiFetch(`/api/add-notification`, {
        method: "POST",
        body: payload,
      });

      payload.id = notifRes.data.event_id;
      payload.sender_id = user.user_id;
      payload.sender_name = user.user_display_name;
      payload.profile_image = user.profile_image;
      payload.gender = user.gender;
      payload.read = false;

      emitPostComment(payload);

      showSnackbar({
        title: "Comment success",
        message: "",
        variant: "success",
      });

      if (modalPost?.post_id === postId) {
        setComments((prev) => [res.comment, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() =>
      showSnackbar({
        title: "Link copied!",
        message: "",
        variant: "success",
      })
    );
  };

  /* -------------------- Modal handling -------------------- */
  const fetchComments = async (page = 1) => {
    if (!modalPost || !hasMoreComments) return;

    setIsFetchingComments(true);
    try {
      const res = await apiFetch(
        `/api/get-comment/${modalPost.post_id}?page=${page}`
      );
      setComments((prev) => [...prev, ...res.data]);
      setCurCommentPage(page + 1);
      setHasMoreComments(res.total_page > page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const lastCommentRef = useCallback(
    (node) => {
      if (isFetchingComments || !hasMoreComments) return;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) fetchComments(curCommentPage);
      });

      if (node) observer.observe(node);
      return () => observer.disconnect();
    },
    [isFetchingComments, hasMoreComments, curCommentPage]
  );

  const openPostModal = (post) => {
    setModalPost(post);
    setIsModalOpen(true);
    setComments([]);
    setCurCommentPage(1);
    setHasMoreComments(true);
    fetchComments(1);
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className={`search-header ${isScrolled ? "scrolled" : ""}`}>
        <div>
          <button className="back-button" onClick={() => router.back()}>
            <ArrowBackIosNewRoundedIcon />
          </button>
          <span className="page-name">Search</span>
        </div>
        <div>
          <div
            className={`search-input-container ${
              isScrolled ? "search-input-container--scrolled" : ""
            }`}
          >
            <TextField
              size="small"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search users or posts..."
              className="search-input"
            />

            <button
              onClick={() => setDebouncedKeyword(keyword.trim())}
              className="search-btn"
            >
              Search
            </button>
          </div>

          <div className="search-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {["all", "users"].includes(activeTab) && (
        <section className="users-section">
          <h3>Users</h3>

          {users.data.length === 0 && loadingUsers ? (
            <p>Loading users...</p>
          ) : users.data.length === 0 ? (
            <p>No users found</p>
          ) : (
            <PeopleGrid
              people={users.data}
              type="add-more"
              hasMore={users.page < users.total_pages}
              loading={loadingUsers}
              onLoadMore={loadMoreUsers}
              showEnd={activeTab !== "all"}
            />
          )}
        </section>
      )}

      {["all", "posts"].includes(activeTab) && (
        <section className="posts-section">
          <h3>Posts</h3>

          {posts.data.length === 0 && loadingPosts ? (
            <p>Loading posts...</p>
          ) : posts.data.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <div className="post-list">
              {posts.data.map((post, index) => {
                const isLast = index === posts.data.length - 1;

                return (
                  <div
                    key={post.post_id ?? index}
                    ref={isLast ? postObserverRef : null}
                  >
                    <PostCard
                      user={{
                        userId: post?.creator?.id,
                        username: post?.creator?.username,
                        name: post?.creator?.display_name ?? "",
                        avatar: post?.creator?.profile_image
                          ? `/api/images?url=${post?.creator?.profile_image}`
                          : "/Images/default-profiles/default.jpg",
                      }}
                      createdAt={post?.created_at}
                      privacy={post.privacy}
                      taggedUsers={post?.tagged_users}
                      content={post?.content}
                      images={post?.attachments}
                      likes={post?.react_count}
                      comments={post?.comment_count}
                      onLike={() => handleReact(post.post_id)}
                      // onComment={(c) => handleComment(post.post_id, c)}
                      onComment={() => {
                        setModalPost(post);
                        setIsModalOpen(true);
                      }}
                      onShare={() => handleShare(post.post_id)}
                      postId={post?.post_id}
                      userReaction={post?.reaction ?? null}
                      onOpen={() => openPostModal(post)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {loadingPosts && <p>Loading more posts...</p>}
        </section>
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
          <SocialPost
            paramPost={modalPost}
            comments={comments}
            lastCommentRef={lastCommentRef}
            onComment={(text) =>
              handleComment(modalPost.post_id, text, modalPost.creator.id)
            }
            onReact={(type) => handleReact(modalPost.post_id, type)}
            onShare={() => handleShare(modalPost.post_id)}
          />
        </Modal>
      )}
    </div>
  );
};

export default SearchResults;
