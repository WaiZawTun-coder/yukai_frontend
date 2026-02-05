"use client";

import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import PostComposer from "@/components/postComposer/PostComposer";
import ProfileImagePost from "@/components/ProfileImagePosts";
import ProfileTabs from "@/components/ProfileTabs";
import SavedList from "@/components/SavedList";
import SavedPost from "@/components/SavedPost";
import Modal from "@/components/ui/Modal";
import ProfileSkeleton from "@/components/ui/ProfileSkeleton";
import TextField from "@/components/ui/TextField";
import SocialPost from "../post/page";
import Popup from "@/components/ui/Popup";

import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { emitAccountRequest } from "@/utilities/socket";

const TABS = [
  { id: 1, name: "Posts", url: "posts" },
  { id: 2, name: "Images", url: "images" },
  { id: 3, name: "Saved", url: "saved" },
  // { id: 4, name: "Tagged", url: "tagged" },
];

const Profile = () => {
  const { user: authUser } = useAuth();
  const params = useParams();
  const apiFetch = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { showSnackbar } = useSnackbar();

  const username = Array.isArray(params.username)
    ? params.username[0]
    : params.username;

  const [user, setUser] = useState({});
  const [posts, setPosts] = useState({
    textPosts: [],
    posts: [],
    saved: [],
    tagged: [],
  });
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  const [isSentRequest, setIsSentRequest] = useState(false);
  const [requestDirection, setRequestDirection] = useState("");
  const [openResponsePopup, setOpenResponsePopup] = useState(false);
  const [openUpdateFriendPopup, setOpenUpdateFriendPopup] = useState(false);
  const [isFriends, setIsFriends] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);

  const [isFetchPosts, setIsFetchPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [isFetchTaggedPosts, setIsFetchTaggedPosts] = useState(false);
  const [hasMoreTaggedPosts, setHasMoreTaggedPosts] = useState(true);

  const [page, setPage] = useState(1);

  const [comments, setComments] = useState([]);
  const [curCommentPage, setCurCommentPage] = useState(1);

  const [selectedSavedList, setSelectedSavedList] = useState(0);

  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [savedLists, setSavedLists] = useState([]);

  const [windowWidth, setWindowWidth] = useState(0);

  const tabsRef = useRef([]);
  const indicatorRef = useRef(null);

  const observerRef = useRef(null);
  const wrapperRef = useRef(null);

  const lastPostRef = useCallback(
    (node) => {
      if (activeTab !== 0 || isFetchPosts || !hasMore) return;

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
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [activeTab, isFetchPosts, hasMore]
  );

  const lastTaggedPostRef = useCallback(
    (node) => {
      if (activeTab !== 3 || isFetchTaggedPosts || !hasMoreTaggedPosts) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) setIsFetchTaggedPosts(true);
        },
        {
          root: null,
          rootMargin: "200px",
          threshold: 0,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [activeTab, hasMoreTaggedPosts, isFetchTaggedPosts]
  );

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    if (!username) router.replace("/");

    const getUserData = async () => {
      // setIsLoading(true);
      setIsFetchPosts(true);
      // TODO: fetch user data with username
      try {
        const res = await apiFetch(`/api/get-user?username=${username}`);

        if (!res.status) {
          showSnackbar({
            title: "Failed to fetch user data",
            message: "Unable to get user data with username - " + username,
            variant: "error",
          });
          return;
        }

        const user = res.data;
        setUser(user);

        setPage(1);

        await fetchUserPosts(1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchPosts(false);
        setIsLoading(false);
      }
    };

    const fetchUserPosts = async (pageToFetch = 1) => {
      try {
        const res = await apiFetch(
          `/api/get-user-post/${username}?page=${pageToFetch}`
        );

        if (!res.status) return;

        setHasMore((res.page ?? 1) < (res.totalPages ?? 1));

        setPosts((prev) => {
          const existingIds = new Set([
            ...prev.textPosts.map((p) => p.post_id),
            ...prev.posts.map((p) => p.post_id),
          ]);

          const nextTextPosts = [];
          const nextImagePosts = [];

          res.data.forEach((post) => {
            if (existingIds.has(post.post_id)) return;

            if (post.attachments.length === 0) {
              nextTextPosts.push(post);
            } else {
              nextImagePosts.push(post);
            }
          });

          return {
            ...prev,
            textPosts: [...prev.textPosts, ...nextTextPosts],
            posts: [...prev.posts, ...nextImagePosts],
          };
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchPosts(false);
      }
    };

    getUserData();
  }, [username, router, showSnackbar, apiFetch]);

  /* ---------------- FETCH SAVED LISTS ---------------- */
  useEffect(() => {
    const getSavedLists = async () => {
      const res = await apiFetch(`/api/get-saved-lists?username=${username}`);

      if (!res.status) {
        showSnackbar({
          title: "Failed to get saved lists",
          message: "Unable to fetch saved lists",
          variant: "error",
        });
      }

      if (res.data) {
        setSavedLists(res.data);
      }
    };

    getSavedLists();
  }, [apiFetch, showSnackbar]);

  useEffect(() => {
    setIsLoggedInUser(authUser && username === authUser.username);
  }, [username, authUser]);

  /* --------------------- Scroll state --------------------- */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(el.scrollTop > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

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

  const fetchUserPosts = async (pageToFetch = 1) => {
    try {
      const res = await apiFetch(
        `/api/get-user-post/${username}?page=${pageToFetch}`
      );

      if (!res.status) return;

      setHasMore((res.page ?? 1) < (res.totalPages ?? 1));

      setPosts((prev) => {
        const existingIds = new Set([
          ...prev.textPosts.map((p) => p.post_id),
          ...prev.posts.map((p) => p.post_id),
        ]);

        const nextTextPosts = [];
        const nextImagePosts = [];

        res.data.forEach((post) => {
          if (existingIds.has(post.post_id)) return;

          if (post.attachments.length === 0) {
            nextTextPosts.push(post);
          } else {
            nextImagePosts.push(post);
          }
        });

        return {
          ...prev,
          textPosts: [...prev.textPosts, ...nextTextPosts],
          posts: [...prev.posts, ...nextImagePosts],
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchPosts(false);
    }
  };

  // const fetchTaggedPosts = async (pageToFetch = 1) => {
  //   try {
  //     const res = `/api/`
  //   } catch (err) {
  //     console.error(err.message);
  //   } finally {
  //     setIsFetchTaggedPosts(false);
  //   }
  // };

  useEffect(() => {
    if (!isFetchPosts || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchUserPosts(nextPage);
  }, [isFetchPosts]);

  const updatePost = (post) => {
    // setData((prev) => {
    //   return { ...prev, [activeTab]: [post, ...prev[activeTab]] };
    // });
    setPosts((prev) => {
      const isContainImage = post.attachments.length > 0;
      if (isContainImage) {
        return { ...prev, posts: [...prev.posts, post] };
      } else {
        return { ...prev, textPosts: [...prev.textPosts, post] };
      }
    });
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    const index = TABS.findIndex((t) => t.url === tab);

    if (index !== -1) setActiveTab(index);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab != null)
      router.replace(`?tab=${TABS[activeTab].url}`, { scroll: false });
  }, [activeTab, router]);

  /* ---------------- CREATE NEW LIST ---------------- */
  const createList = async () => {
    if (!newListName.trim()) return;

    setCreating(true);

    const res = await apiFetch("/api/create-saved-list", {
      method: "POST",
      body: { name: newListName },
    });

    setCreating(false);

    if (!res.status) {
      showSnackbar({
        title: "Failed to create list",
        message: res.message || "Something went wrong",
        variant: "error",
      });
      return;
    }

    setSavedLists((prev) => [...prev, res.data]);
    setNewListName("");
    showSnackbar({
      title: "Saved list created",
      message: `"${res.data.name}" has been created`,
      variant: "success",
    });
  };

  const handleSendRequest = async () => {
    const res = await apiFetch("/api/send-request", {
      method: "POST",
      body: { user_id: user.user_id },
    });

    if (!res.status) {
      return;
    }

    setIsSentRequest(true);
    setRequestDirection("sent");

    const payload = {
      type: "request",
      referenceId: authUser.user_id,
      message: `${authUser.display_name} sent a friend request to you.`,
      target_user_id: [user.user_id],
    };

    if (user.user_id == authUser.user_id) return;

    const notifRes = await apiFetch(`/api/add-notification`, {
      method: "POST",
      body: payload,
    });

    payload.id = notifRes.data.event_id;
    payload.sender_id = authUser.user_id;
    payload.sender_name = authUser.user_display_name;
    payload.profile_image = authUser.profile_image;
    payload.gender = authUser.gender;
    payload.read = false;

    emitAccountRequest(payload);
  };

  const handleResponseRequest = async (type) => {
    if (!(type == "accepted" || type == "rejected" || type == "canceled"))
      return;
    await apiFetch("/api/response-request", {
      method: "POST",
      body: { user_id: user.user_id, status: type },
    });

    if (type == "accepted") {
      const payload = {
        type: "request",
        referenceId: authUser.user_id,
        message: `${authUser.display_name} accepted your friend request.`,
        target_user_id: [user.user_id],
      };

      if (user.user_id == authUser.user_id) return;

      const notifRes = await apiFetch(`/api/add-notification`, {
        method: "POST",
        body: payload,
      });

      payload.id = notifRes.data.event_id;
      payload.sender_id = authUser.user_id;
      payload.sender_name = authUser.user_display_name;
      payload.profile_image = authUser.profile_image;
      payload.gender = authUser.gender;
      payload.read = false;

      emitAccountRequest(payload);
    }
  };

  const goToMessage = () => {
    router.replace(`/chat/${username}`);
  };

  const handleFollow = async () => {
    await apiFetch("/api/follow", {
      method: "POST",
      body: { following_id: user.user_id },
    });

    const payload = {
      type: "request",
      referenceId: authUser.user_id,
      message: `${authUser.display_name} stated to follow you.`,
      target_user_id: [user.user_id],
    };

    if (user.user_id == authUser.user_id) return;

    if (user.user_id == authUser.user_id) return;
    const notifRes = await apiFetch(`/api/add-notification`, {
      method: "POST",
      body: payload,
    });

    payload.id = notifRes.data.event_id;
    payload.sender_id = authUser.user_id;
    payload.sender_name = authUser.user_display_name;
    payload.profile_image = authUser.profile_image;
    payload.gender = authUser.gender;
    payload.read = false;

    emitAccountRequest(payload);
  };

  const handleUnfollow = async () => {
    await apiFetch("/api/unfollow", {
      method: "POST",
      body: { following_id: user.user_id },
    });
  };

  const handleUnfriend = async () => {
    await apiFetch("/api/unfriend", {
      method: "POST",
      body: {
        target_id: user.user_id,
      },
    });
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="profile-page" ref={wrapperRef}>
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowBackIosIcon fontSize="small" />
        </button>
        <span className="page-name">
          {user ? user.display_name : "Loading..."}
        </span>
      </div>
      <div className="profile-card">
        <div className="cover-img">
          <Image
            src={
              user.cover_image
                ? `/api/images?url=${user.cover_image}`
                : "/Images/background.jpg"
            }
            alt="cover"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            loading="eager"
          />
        </div>

        <div className="profile-info">
          <Image
            src={
              user.profile_image
                ? `/api/images?url=${user.profile_image}`
                : `/Images/default-profiles/${user.gender}.jpg`
            }
            alt={user.username ?? "avatar"}
            className="avatar"
            width={120}
            height={120}
          />

          <div className="user-info">
            <div className="info-container">
              <div>
                <h2>{user.display_name}</h2>
                <p className="username">@{username}</p>
                <p className="bio">{user.bio ?? `No bio for @${username}`}</p>
              </div>
              <div className="stats-container">
                <div className="profile-stats">
                  <div>
                    <h3>{user.follower_count}</h3>
                    <span>followers</span>
                  </div>
                  <div>
                    <h3>{user.following_count}</h3>
                    <span>following</span>
                  </div>
                  <div>
                    <h3>{user.friends_count}</h3>
                    <span>friends</span>
                  </div>
                </div>

                <div className="actions">
                  {isLoggedInUser ? (
                    <>
                      <button className="btn light">
                        <EditIcon /> Edit Profile
                      </button>
                      <button className="btn">
                        <WorkspacePremiumIcon />
                        Upgrade profile
                      </button>
                    </>
                  ) : (
                    <>
                      {(user.friend_status == null ||
                        user.friend_status == "rejected" ||
                        user.friend_status == "canceled") &&
                        !isSentRequest && (
                          <button
                            className="btn light"
                            onClick={handleSendRequest}
                          >
                            <PersonAddAlt1Icon />
                            Add friend
                          </button>
                        )}
                      {((isSentRequest && requestDirection === "received") ||
                        (user.friend_status === "pending" &&
                          user.request_direction === "received")) && (
                        <button
                          className="btn light"
                          onClick={() => setOpenResponsePopup(true)}
                        >
                          <ArrowDropDownIcon />
                          Response
                        </button>
                      )}

                      {((isSentRequest && requestDirection == "sent") ||
                        (user.friend_status === "pending" &&
                          user.request_direction === "sent")) && (
                        <button
                          className="btn light"
                          onClick={() => {
                            handleResponseRequest("canceled");
                            setIsSentRequest(false);
                          }}
                        >
                          <CloseIcon />
                          Cancel Request
                        </button>
                      )}
                      {(user.friend_status == "accepted" || isFriends) && (
                        <button
                          className="btn light"
                          onClick={() => setOpenUpdateFriendPopup(true)}
                        >
                          <DoneIcon />
                          Friend
                        </button>
                      )}
                      <button className="btn" onClick={goToMessage}>
                        <MessageIcon />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="extra-info">
              {/* TODO: update database schema */}
              {/* <p className="status">Single ♥️</p> */}
              <p className="see-info">••• See your info</p>
            </div>
          </div>
        </div>
      </div>

      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedInUser={isLoggedInUser}
      />
      {/* POSTS TAB */}
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          display: activeTab == 0 ? "flex" : "none",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {isLoggedInUser && <PostComposer handleCreate={updatePost} />}

        {posts.textPosts.map((post, index) => {
          const isLast = index === posts.textPosts.length - 1;
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
                  setIsModalOpen(true);
                  setModalPost(post);
                }}
              />
            </div>
          );
        })}
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

      {/* IMAGES TAB */}
      <div
        className={activeTab == 1 ? "block" : "hidden"}
        style={{ width: "100%", maxWidth: "720px" }}
      >
        <ProfileImagePost posts={posts.posts} />
      </div>
      {/* SAVED TAB */}

      {isLoggedInUser && (
        <div
          className={activeTab == 2 ? "block" : "hidden"}
          style={{ width: "100%", maxWidth: "720px" }}
        >
          {/* CREATE NEW LIST */}
          <div className="create-list">
            <TextField
              label="Saved List Name"
              name="saved-list-name"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              color="accent"
            />
            <button onClick={createList} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </button>
          </div>

          <div
            className="saved-tab-container"
            style={{
              gap: selectedSavedList && windowWidth > 992 ? "24px" : "0",
            }}
          >
            <div
              style={{
                overflow: "hidden",
                maxWidth: selectedSavedList ? "84px" : "100%",
                transition: "all 300ms ease",
                flex: 1,
              }}
              className="saved-list-container"
            >
              <SavedList
                setSelectedSavedList={setSelectedSavedList}
                savedLists={savedLists}
              />
            </div>
            <div
              className={`saved-posts `}
              style={{
                width: selectedSavedList ? "100%" : "0px",
              }}
            >
              <SavedPost
                goBack={() => {
                  setSelectedSavedList(0);
                }}
                savePostList={selectedSavedList}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAGGED TAB */}
      {/* <div
        style={{
          width: "100%",
          display: activeTab == 3 ? "flex" : "none",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {posts.textPosts.map((post, index) => {
          const isLast = index === posts.textPosts.length - 1;
          return (
            <div
              key={post.post_id}
              ref={isLast ? lastTaggedPostRef : null}
              className="profile-post"
            >
              <SocialPost
                paramPost={post}
                isCommentOpen={false}
                handleCommentClick={() => {
                  setIsModalOpen(true);
                  setModalPost(post);
                }}
              />
            </div>
          );
        })}
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
      </div> */}

      {/* Action button modal response */}
      <Popup
        isOpen={openResponsePopup}
        onClose={() => {
          setOpenResponsePopup(false);
        }}
        title="Response Request"
      >
        <div className="popup-actions">
          <button
            className="popup-btn"
            onClick={() => {
              handleResponseRequest("accepted");
              setIsSentRequest(false);
              setIsFriends(true);
              setOpenResponsePopup(false);
            }}
          >
            <DoneIcon />
            Accept
          </button>
          <button
            className="popup-btn"
            onClick={() => {
              handleResponseRequest("rejected");
              setIsSentRequest(false);
              setOpenResponsePopup(false);
            }}
          >
            <CloseIcon />
            Reject
          </button>
        </div>
      </Popup>

      {/* Update friend status popup */}
      <Popup
        isOpen={openUpdateFriendPopup}
        onClose={() => setOpenUpdateFriendPopup(false)}
        title="Update Friend"
      >
        <div className="popup-actions">
          <button
            className="popup-btn"
            onClick={() => {
              handleUnfriend();
              setOpenUpdateFriendPopup(false);
            }}
          >
            Unfriend
          </button>
          <button
            className="popup-btn"
            onClick={() => {
              if (user.is_following) {
                handleUnfollow();
              } else handleFollow();
              setOpenUpdateFriendPopup(false);
            }}
          >
            {user.is_following ? "Unfollow" : "Follow"}
            {/* Unfollow */}
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default Profile;
