"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useApi } from "@/utilities/api";
import { useSearchParams } from "next/navigation";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const apiFetch = useApi();
  const keyword = searchParams.get("q") || "";

  const [users, setUsers] = useState({
    page: 1,
    total_pages: 1,
    data: [],
  });
  const [posts, setPosts] = useState({
    page: 1,
    total_pages: 1,
    data: [],
  });

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const userObserverRef = useRef(null);
  const postObserverRef = useRef(null);

  /* -------------------- Fetch Functions -------------------- */

  const fetchUsers = async (page = 1, append = false) => {
    if (!keyword.trim()) return;
    if (page > users.total_pages) return;

    setLoadingUsers(true);
    try {
      const res = await apiFetch(
        `/api/search/users?q=${encodeURIComponent(keyword)}&page=${page}`
      );

      if (res.status) {
        const { data, total_pages } = res.data;
        setUsers((prev) => ({
          page,
          total_pages,
          data: append ? [...prev.data, ...data] : data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPosts = async (page = 1, append = false) => {
    if (!keyword.trim()) return;
    if (page > posts.total_pages) return;

    setLoadingPosts(true);
    try {
      const res = await apiFetch(
        `/api/search/posts?q=${encodeURIComponent(keyword)}&page=${page}`
      );

      if (res.status) {
        const { data, total_pages } = res.data;
        setPosts((prev) => ({
          page,
          total_pages,
          data: append ? [...prev.data, ...data] : data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  /* -------------------- Initial Load -------------------- */

  useEffect(() => {
    if (!keyword) return;
    setUsers({ page: 1, total_pages: 1, data: [] });
    setPosts({ page: 1, total_pages: 1, data: [] });
    fetchUsers(1, false);
    fetchPosts(1, false);
  }, [keyword]);

  /* -------------------- Infinite Scroll -------------------- */

  // Users infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          !loadingUsers &&
          users.page < users.total_pages
        ) {
          fetchUsers(users.page + 1, true);
        }
      },
      { threshold: 1 }
    );

    if (userObserverRef.current) observer.observe(userObserverRef.current);

    return () => observer.disconnect();
  }, [users, loadingUsers]);

  // Posts infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          !loadingPosts &&
          posts.page < posts.total_pages
        ) {
          fetchPosts(posts.page + 1, true);
        }
      },
      { threshold: 1 }
    );

    if (postObserverRef.current) observer.observe(postObserverRef.current);

    return () => observer.disconnect();
  }, [posts, loadingPosts]);

  /* -------------------- Render -------------------- */

  return (
    <div className="search-results-wrapper">
      <h2>Search results for &quot;{keyword}&quot;</h2>

      {/* -------------------- Users Section -------------------- */}
      <section className="users-section">
        <h3>Users</h3>
        {users.data.length === 0 && loadingUsers ? (
          <p>Loading users...</p>
        ) : users.data.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="user-list">
            {users.data.map((user) => (
              <li key={user.user_id} className="user-item">
                <Image
                  src={
                    user.profile_image
                      ? user.profile_image
                      : "/Images/default-profiles/male.jpg"
                  }
                  alt={user.display_name}
                  width={50}
                  height={50}
                  className="user-avatar"
                />
                <div className="user-info">
                  <p className="display-name">{user.display_name}</p>
                  <p className="username">@{user.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={userObserverRef} />
        {loadingUsers && <p>Loading more users...</p>}
      </section>

      {/* -------------------- Posts Section -------------------- */}
      <section className="posts-section">
        <h3>Posts</h3>
        {posts.data.length === 0 && loadingPosts ? (
          <p>Loading posts...</p>
        ) : posts.data.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <ul className="post-list">
            {posts.data.map((post) => (
              <li key={post.post_id} className="post-item">
                <div className="post-header">
                  <Image
                    src={
                      post.creator.profile_image
                        ? post.creator.profile_image
                        : "/Images/default-profiles/male.jpg"
                    }
                    alt={post.creator.display_name}
                    width={40}
                    height={40}
                    className="creator-avatar"
                  />
                  <div className="creator-info">
                    <p className="creator-name">{post.creator.display_name}</p>
                    <p className="post-date">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="post-content">{post.content}</div>

                {post.attachments.length > 0 && (
                  <div className="post-attachments">
                    {post.attachments.map((att) => (
                      <Image
                        key={att.post_attachment_id}
                        src={att.file_path}
                        alt="Attachment"
                        width={200}
                        height={200}
                        className="post-attachment"
                      />
                    ))}
                  </div>
                )}

                <div className="post-meta">
                  <span>Reacts: {post.react_count}</span>
                  <span>Comments: {post.comment_count}</span>
                  {post.is_liked && <span>❤️ Liked</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={postObserverRef} />
        {loadingPosts && <p>Loading more posts...</p>}
      </section>
    </div>
  );
};

export default SearchResults;
