"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { offNotification, onNotification } from "@/utilities/socket";

const iconMap = {
  react: <FavoriteOutlinedIcon className="notif-icon like" />,
  comment: <MessageOutlinedIcon className="notif-icon comment" />,
  follow: <PersonOutlinedIcon className="notif-icon follow" />,
};

export default function NotificationMenu() {
  const apiFetch = useApi();
  const router = useRouter();

  const loaderRef = useRef(null);
  const wrapperRef = useRef(null);

  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [isScrolled, setIsScrolled] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* --------------------- Scroll state --------------------- */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleScroll = () => setIsScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleNotification = (payload) => {
      const {
        id,
        type,
        referenceId,
        message,
        target_user_id,
        created_at,
        sender_name,
        sender_id,
        gender,
      } = payload;
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));

        if (!existingIds.has(id)) {
          return [
            {
              id,
              type,
              reference_id: referenceId,
              message,
              target_user_id,
              time: created_at,
              sender_id,
              sender_name,
              gender,
            },
            ...prev,
          ];
        }
        return prev;
      });
    };
    onNotification(handleNotification);

    return () => offNotification(handleNotification);
  }, []);

  // 🔹 Fetch notifications
  const getNotifications = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await apiFetch(`/api/get-notifications?page=${page}`);

      if (
        res?.status === true &&
        Array.isArray(res.data) &&
        res.data.length > 0
      ) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));

          const newItems = res.data.filter((n) => !existingIds.has(n.id));

          return newItems.length ? [...prev, ...newItems] : prev;
        });
      }

      if (typeof res?.has_more === "boolean") {
        setHasMore(res.has_more);
      }
    } catch (err) {
      console.error("Notification fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, loading, hasMore]);

  // 🔹 Initial + pagination load
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // 🔹 Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // 🔹 Mark single notification as read
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await apiFetch(`/api/mark-notification-read`, {
        method: "POST",
        body: { id },
      });
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const redirect = async (type, target) => {
    if (type == "react" || type == "comment") {
      router.push(`/post?post_id=${target}`);
    } else if (type == "request") {
      const res = await apiFetch(`/api/get-user?user_id=${target}`);
      // console.log({ res });
      router.push(`/${res.data.username}`);
    }
  };

  function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp; // difference in ms

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await apiFetch(`/api/mark-notifications-read`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  return (
    <div className="notif-root" ref={wrapperRef}>
      <div className={`notif-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="notif-header-info">
          <button className="back-button" onClick={() => router.back()}>
            <ArrowBackIosIcon fontSize="small" />
          </button>
          <span className="page-name">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </span>
        </div>
        {unreadCount > 0 && (
          <button className="mark-read" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-wrapper">
        {notifications.length === 0 && !loading && (
          <div className="notif-empty">No notifications yet</div>
        )}

        <ul className="notif-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notif-item ${!n.read ? "unread" : ""}`}
              onClick={() => {
                !n.read && markAsRead(n.id);
                redirect(n.type, n.reference_id);
              }}
            >
              <Image
                src={
                  n.profile_image
                    ? `/api/images?url=${n.profile_image}`
                    : `/Images/default-profiles/${n.gender}.jpg`
                }
                alt={n.sender_name}
                width={40}
                height={40}
                style={{ borderRadius: "50%" }}
              />
              {/* <div className="notif-icon-wrap">{iconMap[n.type]}</div> */}

              <div className="notif-content">
                <p>{n.message}</p>
                <span>{timeAgo(new Date(n.time))}</span>
              </div>

              {!n.read && <span className="unread-dot" />}
            </li>
          ))}
        </ul>

        {hasMore && (
          <div ref={loaderRef} className="notif-loading">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
