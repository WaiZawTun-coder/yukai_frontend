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

  const typeParam = searchParams.get("type");
  const queryParam = searchParams.get("q") || "";

  const [keyword, setKeyword] = useState(queryParam);
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [activeTab, setActiveTab] = useState(typeParam || "all");

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

  // -------------------- Debounce input --------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  // --------------------- check if scrolled ------------------
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 10); // threshold as you like
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------- Sync URL type --------------------
  useEffect(() => {
    if (typeParam && typeParam !== activeTab) setActiveTab(typeParam);
  }, [typeParam]);

  // -------------------- Fetch search results --------------------
  const fetchResults = useCallback(
    async (page = 1) => {
      if (!debouncedKeyword) return;
      setLoadingUsers(true);
      setLoadingPosts(true);

      try {
        const res = await apiFetch(
          `/api/search?keyword=${encodeURIComponent(
            debouncedKeyword
          )}&page=${page}`
        );
        if (res.status) {
          const { users: usersRes, posts: postsRes } = res.data;

          setUsers((prev) => ({
            page: usersRes.page,
            total_pages: usersRes.total_pages,
            data: page === 1 ? usersRes.data : [...prev.data, ...usersRes.data],
          }));

          setPosts((prev) => ({
            page: postsRes.page,
            total_pages: postsRes.total_pages,
            data: page === 1 ? postsRes.data : [...prev.data, ...postsRes.data],
          }));
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoadingUsers(false);
        setLoadingPosts(false);
      }
    },
    [debouncedKeyword, apiFetch]
  );

  // -------------------- Fetch on keyword change --------------------
  useEffect(() => {
    if (!debouncedKeyword) {
      setUsers({ page: 1, total_pages: 1, data: [] });
      setPosts({ page: 1, total_pages: 1, data: [] });
      return;
    }
    fetchResults(1);
    router.push(
      `?q=${encodeURIComponent(debouncedKeyword)}&type=${activeTab}`,
      { scroll: false }
    );
  }, [debouncedKeyword, fetchResults, activeTab]);

  // -------------------- Infinite scroll --------------------
  const loadMoreUsers = () => {
    if (!loadingUsers && users.page < users.total_pages)
      fetchResults(users.page + 1);
  };

  const loadMorePosts = useCallback(() => {
    if (!loadingPosts && posts.page < posts.total_pages)
      fetchResults(posts.page + 1);
  }, [loadingPosts, posts.page, posts.total_pages, fetchResults]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMorePosts();
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    if (postObserverRef.current) observer.observe(postObserverRef.current);
    return () => observer.disconnect();
  }, [loadMorePosts]);

  // -------------------- Tab change --------------------
  const handleTabChange = (tab) => {
    setActiveTab(tab.value);
    router.push(
      `?q=${encodeURIComponent(debouncedKeyword)}&type=${tab.value}`,
      { scroll: false }
    );
  };

  // -------------------- PostCard handlers --------------------
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

  const handleComment = async (postId, commentText) => {
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

      showSnackbar({
        title: "Comment success",
        message: "",
        variant: "success",
      });
      if (modalPost?.post_id === postId)
        setComments((prev) => [res.comment, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard
      .writeText(postUrl)
      .then(() =>
        showSnackbar({ title: "Link copied!", message: "", variant: "success" })
      );
  };

  // -------------------- Modal handling --------------------
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
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) fetchComments(curCommentPage);
        },
        { root: null, rootMargin: "100px", threshold: 0 }
      );
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

  // -------------------- Render --------------------
  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <h2>Search</h2>
      <div className={`search-header ${isScrolled ? "scrolled" : ""}`}>
        <div
          className={`search-input-container ${
            isScrolled ? "search-input-container--scrolled" : ""
          }`}
        >
          {/* BACK BUTTON */}
          <button
            className={`back-btn show`}
            onClick={() => {
              router.replace("/");
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </button>
          <input
            type="text"
            value={keyword}
            placeholder="Search users or posts..."
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => setDebouncedKeyword(keyword.trim())}
            className="search-btn"
          >
            Search
          </button>
        </div>

        <div className="tabs">
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

      {["all", "users"].includes(activeTab) && (
        <section className="users-section">
          <h3>Users</h3>
          {users.data.length == 0 && loadingUsers ? (
            <p>Loading users...</p>
          ) : users.data.length == 0 ? (
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
                        username: post?.creator?.username,
                        name: post?.creator?.display_name ?? "",
                        avatar: post?.creator?.profile_image
                          ? `/api/images?url=${post?.creator?.profile_image}`
                          : "/Images/default-profiles/default.jpg",
                      }}
                      createdAt={post?.created_at}
                      content={post?.content}
                      images={post?.attachments}
                      likes={post?.react_count}
                      comments={post?.comment_count}
                      onLike={() => handleReact(post.post_id)}
                      onComment={(c) => handleComment(post.post_id, c)}
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
            onComment={(text) => handleComment(modalPost.post_id, text)}
            onReact={(type) => handleReact(modalPost.post_id, type)}
            onShare={() => handleShare(modalPost.post_id)}
          />
        </Modal>
      )}
    </div>
  );
};

export default SearchResults;
