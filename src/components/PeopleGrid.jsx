"use client";

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import Image from "next/image";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Button from "./ui/Button";
import { useApi } from "@/utilities/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { emitAccountRequest } from "@/utilities/socket";

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
  "sent-requests": {
    primary: {
      label: {
        default: "Cancel Request",
        pending: "Requesting...",
        done: "Add Friend",
      },
      action: "cancel_request",
    },
    secondary: null,
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
  showEnd = true,
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
        },
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore],
  );

  return (
    <div className="friends-grid">
      {list.map((person, index) => {
        const isLast = index === list.length - 1;

        return (
          <PeopleCard
            person={person}
            type={type}
            removeCard={() =>
              setList((prev) =>
                prev.filter((p) => p.user_id !== person.user_id),
              )
            }
            setOpenMenuId={() => {}}
            key={person.user_id}
            ref={isLast ? lastItemRef : null}
          />
        );
      })}

      <div
        style={{
          textAlign: "center",
          padding: "12px",
          opacity: 0.6,
        }}
        className="people-grid-end"
      >
        {showEnd &&
          (loading
            ? "Loading more..."
            : hasMore
              ? "Scroll to load more"
              : `End of ${type.split("-").join(" ")}`)}
      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

export const PeopleCard = forwardRef(function PeopleCard(
  { person, type, openMenuId, setOpenMenuId, removeCard },
  ref,
) {
  const apiFetch = useApi();
  const router = useRouter();
  const menuRef = useRef(null);
  const { user } = useAuth();

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
      let payload;
      let notifRes;
      switch (action) {
        case "send_request":
          await apiFetch("/api/send-request", {
            method: "POST",
            body: { user_id: person.user_id },
          });
          setCompleted(true);
          payload = {
            type: "request",
            referenceId: user.user_id,
            message: `${user.display_name} sent a friend request to you.`,
            target_user_id: [person.user_id],
          };

          if (person.user_id == user.user_id) return;

          notifRes = await apiFetch(`/api/add-notification`, {
            method: "POST",
            body: payload,
          });

          payload.id = notifRes.data.event_id;
          payload.sender_id = user.user_id;
          payload.sender_name = user.user_display_name;
          payload.profile_image = user.profile_image;
          payload.gender = user.gender;
          payload.read = false;

          emitAccountRequest(payload);
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
          payload = {
            type: "request",
            referenceId: user.user_id,
            message: `${user.display_name} accepted your friend request`,
            target_user_id: [person.user_id],
          };

          if (person.user_id == user.user_id) return;

          notifRes = await apiFetch(`/api/add-notification`, {
            method: "POST",
            body: payload,
          });

          payload.id = notifRes.data.event_id;
          payload.sender_id = user.user_id;
          payload.sender_name = user.user_display_name;
          payload.profile_image = user.profile_image;
          payload.gender = user.gender;
          payload.read = false;

          emitAccountRequest(payload);
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
          payload = {
            type: "request",
            referenceId: user.user_id,
            message: `${user.display_name} started to follow you.`,
            target_user_id: [person.user_id],
          };

          if (person.user_id == user.user_id) return;

          notifRes = await apiFetch(`/api/add-notification`, {
            method: "POST",
            body: payload,
          });

          payload.id = notifRes.data.event_id;
          payload.sender_id = user.user_id;
          payload.sender_name = user.user_display_name;
          payload.profile_image = user.profile_image;
          payload.gender = user.gender;
          payload.read = false;

          emitAccountRequest(payload);
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
    <div
      ref={ref}
      className="people-card"
      onClick={() => {
        router.replace(`/${person.username}`);
      }}
    >
      {/* MENU */}
      {config.menu.length > 0 && (
        <button
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(
              openMenuId === person.user_id ? null : person.user_id,
            );
          }}
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
      <div className="avatar-wrapper">
        <Image
          src={
            person.profile_image
              ? `/api/images?url=${person.profile_image}`
              : `/Images/default-profiles/${person.gender}.jpg`
          }
          alt={person.username}
          width={64}
          height={64}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
      </div>

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
});
