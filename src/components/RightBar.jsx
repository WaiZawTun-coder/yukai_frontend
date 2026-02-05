"use client";

import MessageIcon from "@mui/icons-material/Message";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import Image from "next/image";
import { useApi } from "@/utilities/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  connectSocket,
  isSocketConnected,
  requestOnlineUsers,
  onOnlineUsers,
  onUserOnline,
  onUserOffline,
  offPresenceListeners,
} from "@/utilities/socket";

const RightBar = () => {
  const apiFetch = useApi();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [friends, setFriends] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);

  /* ===================== SOCKET PRESENCE ===================== */

  useEffect(() => {
    if (!isSocketConnected()) {
      connectSocket();
    }

    onOnlineUsers(({ users }) => {
      setOnlineUserIds(new Set(users.map(String)));
    });

    requestOnlineUsers();

    onUserOnline(({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(String(userId));
        return next;
      });
    });

    onUserOffline(({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    });

    return () => {
      offPresenceListeners();
    };
  }, []);

  /* ===================== FETCH FRIENDS ===================== */

  useEffect(() => {
    let mounted = true;

    const getUsers = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/get-friends?page=${page}`);
        const newData = res?.data || [];

        if (!mounted) return;

        if (newData.length === 0) {
          setHasMore(false);
          return;
        }

        setFriends((prev) => {
          const oldFriendIds = new Set(prev.map((f) => f.user_id));
          const newFriends = newData.filter(
            (f) => !oldFriendIds.has(f.user_id)
          );
          return [...prev, ...newFriends];
        });
      } catch (err) {
        console.error("Fetch friends failed:", err);
      } finally {
        mounted && setIsLoading(false);
      }
    };

    hasMore && getUsers();

    return () => {
      mounted = false;
    };
  }, [apiFetch, page, hasMore]);

  /* ===================== DERIVED DATA ===================== */

  const friendsWithStatus = useMemo(() => {
    return friends.map((f) => ({
      ...f,
      status: onlineUserIds.has(String(f.user_id)) ? "online" : "offline",
    }));
  }, [friends, onlineUserIds]);

  const onlineFriends = useMemo(
    () => friendsWithStatus.filter((f) => f.status === "online"),
    [friendsWithStatus]
  );

  const visibleFriends =
    activeTab === "online" ? onlineFriends : friendsWithStatus;

  /* ===================== INFINITE SCROLL ===================== */

  const lastRowRef = useCallback(
    (node) => {
      if (!node || isLoading || !hasMore) return;

      observerRef.current?.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      observerRef.current.observe(node);
    },
    [isLoading, hasMore]
  );

  /* ===================== UI ===================== */

  return (
    <div className="rightbar-wrapper">
      <div className="container">
        <div className="header-icons">
          <NotificationsActiveIcon />
          <MessageIcon onClick={() => router.push("/chat")} />
        </div>

        <div className="friend-header">
          <span className="count-text">
            {onlineFriends.length === 0
              ? "No online friend"
              : `Friend • ${onlineFriends.length} online`}
          </span>

          <div className="friend-tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>

            <button
              className={activeTab === "online" ? "active" : ""}
              onClick={() => setActiveTab("online")}
            >
              Online
            </button>
          </div>
        </div>

        <div className="friend-list">
          {visibleFriends.map((user, i) => {
            const isLast = i === visibleFriends.length - 1;

            return (
              <div
                key={user.user_id}
                ref={isLast ? lastRowRef : null}
                className="friend-item"
                onClick={() => router.replace(`/${user.username}`)}
              >
                <div className="friend-info">
                  <div className="friend-list-avatar-wrapper">
                    <Image
                      src={
                        user.profile_image
                          ? `/api/images?url=${user.profile_image}`
                          : `/Images/default-profiles/${user.gender}.jpg`
                      }
                      alt={user.username}
                      width={45}
                      height={45}
                    />
                    <div className={`status-dot ${user.status}`} />
                  </div>

                  <span className="friend-name">{user.display_name}</span>
                </div>

                <div className="friend-actions">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      router.replace(`/chat/${user.username}`);
                    }}
                  >
                    <MessageIcon />
                  </span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <MoreHorizOutlinedIcon />
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && <div className="friend-list-end">Loading more...</div>}
          {!hasMore && <div className="friend-list-end">No more friends</div>}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
