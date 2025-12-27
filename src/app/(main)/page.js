"use client";

import PostCard from "@/components/PostCard/postCard";
import PostComposer from "@/components/postComposer/PostComposer";
import { useApi } from "@/utilities/api";
import { useEffect, useRef, useState } from "react";

const { default: TopBar } = require("@/components/TopBar");

const Home = () => {
  const apiFetch = useApi();
  // const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("foryou");
  const [isFetchPosts, setIsFetchPosts] = useState(false);

  const [data, setData] = useState({ foryou: [], following: [], friends: [] });
  const [hasMore, setHasMore] = useState({
    foryou: true,
    following: true,
    friends: true,
  });
  const [curPage, setCurPage] = useState({
    foryou: 1,
    following: 1,
    friends: 1,
  });
  const observerRef = useRef(null);

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
          rootMargin: "200px", // fetch earlier before reaching bottom
          threshold: 0,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetchPosts, hasMore, activeTab]
  );

  useEffect(() => {
    if (!activeTab) return;

    const fetchPosts = async () => {
      let data;

      if (activeTab == "foryou") {
        data = await apiFetch("/api/get-post?page=" + curPage.foryou);
      } else if (activeTab == "friends") {
        data = await apiFetch("/api/get-post?page=" + curPage.friends);
      } else if (activeTab == "following") {
        data = await apiFetch(
          "/api/get-following-post?page=" + curPage.following
        );
      }

      setData((prev) => {
        return { ...prev, [activeTab]: [...prev[activeTab], ...data.data] };
      });
      if (data.page >= data.totalPages)
        setHasMore((prev) => {
          return { ...prev, [activeTab]: false };
        });
      setCurPage((prev) => {
        return { ...prev, [activeTab]: data.page + 1 };
      });
      setIsFetchPosts(false);
    };

    if (isFetchPosts) fetchPosts();
  }, [activeTab, apiFetch, isFetchPosts, curPage]);

  useEffect(() => {
    console.table(data);
  }, [data]);

  useEffect(() => {
    const update = () => setIsFetchPosts(true);
    update();
  }, [activeTab]);

  useEffect(() => {
    const update = () => setIsFetchPosts(true);
    update();
  }, []);

  return (
    <div>
      <TopBar setData={setActiveTab} />
      {/* POST INPUT */}
      {/* <CreatePost /> */}
      <PostComposer />

      <div className="post-container">
        {/* Post list */}
        {data[activeTab].map((post, index) => {
          const isLast = index === data[activeTab].length - 1;
          return (
            <div ref={isLast ? lastPostRef : null} key={post.post_id ?? index}>
              <PostCard
                user={{
                  name: post.creator.display_username,
                  avatar:
                    post.creator.profile_image != ""
                      ? post.creator.profile_image
                      : `/Images/default-profiles/${post.creator.gender}.jpg`,
                }}
                createdAt={post.created_at}
                content={post.content}
                images={post.attachments}
                likes={post.react_count}
                comments={post.comment_count}
                onLike={() => console.log("Liked post: " + post.post_id)}
                onComment={() => console.log("Comment post: " + post.post_id)}
                onShare={() => console.log("Share post: " + post.post_id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
