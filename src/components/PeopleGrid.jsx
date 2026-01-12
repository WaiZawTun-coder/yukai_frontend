"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Button from "./ui/Button";
import { useApi } from "@/utilities/api";
import { useRouter } from "next/navigation";

const ACTION_CONFIG = {
  friends: {
    primary: null,
    secondary: null,
    menu: [],
  },
  "add-more": {
    primary: {
      label: {
        default: "Add Friend",
        pending: "Requesting...",
        done: "Cancel Request",
      },
      action: "send_request",
    },
    secondary: null,
    menu: ["block"],
  },

  requests: {
    primary: {
      label: {
        default: "Accept",
        pending: "Accepting...",
        done: "Friends",
      },
      action: "accept_request",
    },
    secondary: {
      label: {
        default: "Reject",
        pending: "Rejecting...",
      },
      action: "reject_request",
    },
    menu: ["block"],
  },

  following: {
    primary: {
      label: {
        default: "Unfollow",
        pending: "Unfollowing...",
        done: "Follow",
      },
      action: "unfollow",
    },
    secondary: {
      label: {
        default: "View Profile",
      },
      action: "view",
    },
    menu: ["block"],
  },
};

/* ---------------- GRID ---------------- */

export default function PeopleGrid({
  people,
  type,
  onLoadMore,
  hasMore,
  loading,
}) {
  const [list, setList] = useState(people);
  const observerRef = useRef(null);

  /* ---------------- Sync external updates ---------------- */
  useEffect(() => {
    setList(people);
  }, [people]);

  /* ---------------- Infinite scroll observer ---------------- */
  const lastItemRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore?.();
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
    [loading, hasMore, onLoadMore]
  );

  return (
    <div className="friends-grid">
      {list.map((person, index) => {
        const isLast = index === list.length - 1;

        return (
          <div key={person.user_id} ref={isLast ? lastItemRef : null}>
            <PeopleCard
              person={person}
              type={type}
              removeCard={() =>
                setList((prev) =>
                  prev.filter((p) => p.user_id !== person.user_id)
                )
              }
              setOpenMenuId={() => {}}
            />
          </div>
        );
      })}

      <div
        style={{
          textAlign: "center",
          padding: "12px",
          opacity: 0.6,
          gridColumn: "span 2",
        }}
      >
        {loading
          ? "Loading more..."
          : hasMore
          ? "Scroll to load more"
          : `End of ${type.split("-").join(" ")}`}
      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function PeopleCard({ person, type, openMenuId, setOpenMenuId, removeCard }) {
  const apiFetch = useApi();
  const router = useRouter();
  const menuRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const config = ACTION_CONFIG[type];

  /* -------- Close menu on outside click -------- */
  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId === person.user_id) {
      document.addEventListener("mousedown", close);
    }

    return () => document.removeEventListener("mousedown", close);
  }, [openMenuId, person.user_id, setOpenMenuId]);

  /* -------- API HANDLER -------- */
  const runAction = async (action) => {
    setLoading(true);

    if (action === "reject_request" || action === "block") {
      removeCard();
    }

    try {
      switch (action) {
        case "send_request":
          await apiFetch("/api/send-request", {
            method: "POST",
            body: { user_id: person.user_id },
          });
          setCompleted(true);
          break;

        case "cancel_request":
          await apiFetch("/api/response-request", {
            method: "POST",
            body: { user_id: person.user_id, status: "canceled" },
          });
          setCompleted(false);
          break;

        case "accept_request":
          await apiFetch("/api/response-request", {
            method: "POST",
            body: { user_id: person.user_id, status: "accepted" },
          });
          setCompleted(true);
          break;

        case "reject_request":
          await apiFetch("/api/response-request", {
            method: "POST",
            body: { user_id: person.user_id, status: "rejected" },
          });
          break;

        case "follow":
          await apiFetch("/api/follow", {
            method: "POST",
            body: { user_id: person.user_id },
          });
          break;

        case "unfollow":
          await apiFetch("/api/unfollow", {
            method: "POST",
            body: { user_id: person.user_id },
          });
          break;

        case "block":
          await apiFetch("/api/block-user", {
            method: "POST",
            body: { user_id: person.user_id },
          });
          break;

        case "view":
          router.push(`/${person.username}`);
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };

  if (!config) return null;

  return (
    <div className="people-card">
      {/* MENU */}
      {config.menu.length > 0 && (
        <button
          className="menu-btn"
          onClick={() =>
            setOpenMenuId(openMenuId === person.user_id ? null : person.user_id)
          }
        >
          <MoreHorizRoundedIcon />
        </button>
      )}

      {openMenuId === person.user_id && (
        <div ref={menuRef} className="card-menu">
          {config.menu.includes("block") && (
            <button className="danger" onClick={() => runAction("block")}>
              Block
            </button>
          )}
        </div>
      )}

      {/* AVATAR */}
      <Image
        src={
          person.profile_image
            ? `/api/images?url=${person.profile_image}`
            : `/Images/default-profiles/${person.gender}.jpg`
        }
        alt={person.username}
        width={64}
        height={64}
        style={{ borderRadius: "50%" }}
      />

      {/* INFO */}
      <div className="user-text">
        <span className="display-name">{person.display_name}</span>
        <span className="username">@{person.username}</span>
        {person.location && <span className="location">{person.location}</span>}
      </div>

      {/* ACTION BUTTONS */}
      <div className="card-buttons">
        {config.primary && (
          <Button
            disabled={loading}
            onClick={() =>
              runAction(completed ? "cancel_request" : config.primary.action)
            }
          >
            {
              config.primary.label[
                loading ? "pending" : completed ? "done" : "default"
              ]
            }
          </Button>
        )}

        {config.secondary && (
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => runAction(config.secondary.action)}
          >
            {config.secondary.label.default}
          </Button>
        )}
      </div>
    </div>
  );
}
