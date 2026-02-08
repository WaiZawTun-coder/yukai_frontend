"use client";

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import Image from "next/image";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Button from "./ui/Button";
import { useApi } from "@/utilities/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { emitAccountRequest } from "@/utilities/socket";

/* ----------------- Action Config ----------------- */
const ACTION_CONFIG = {
  friends: { primary: null, secondary: null, menu: [] },
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
      label: { default: "Accept", pending: "Accepting...", done: "Friends" },
      action: "accept_request",
    },
    secondary: {
      label: { default: "Reject", pending: "Rejecting..." },
      action: "reject_request",
    },
    menu: ["block"],
  },
  following: {
    primary: {
      label: { default: "Unfollow", pending: "Unfollowing...", done: "Follow" },
      action: "unfollow",
    },
    secondary: {
      label: { default: "View Profile" },
      action: "view",
    },
    menu: ["block"],
  },
};

/* ----------------- Determine User Type ----------------- */
const getUserActionType = (person, currentUser) => {
  if (person.user_id === currentUser.user_id) return "self";
  if (person.isFriend) return "friends";
  if (person.requestSent) return "add-more";
  if (person.requestReceived) return "requests";
  if (person.following) return "following";
  return "add-more";
};

/* ----------------- People Grid ----------------- */
export default function SearchPeopleGrid({
  people,
  onLoadMore,
  hasMore,
  loading,
  showEnd = true,
}) {
  const [list, setList] = useState(people);
  const observerRef = useRef(null);

  useEffect(() => setList(people), [people]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) onLoadMore?.();
        },
        { root: null, rootMargin: "200px", threshold: 0 }
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
          <PeopleCard
            key={person.user_id}
            person={person}
            removeCard={() =>
              setList((prev) =>
                prev.filter((p) => p.user_id !== person.user_id)
              )
            }
            ref={isLast ? lastItemRef : null}
          />
        );
      })}

      {showEnd && (
        <div
          style={{ textAlign: "center", padding: "12px", opacity: 0.6 }}
          className="people-end"
        >
          {loading
            ? "Loading more..."
            : hasMore
            ? "Scroll to load more"
            : "End of results"}
        </div>
      )}
    </div>
  );
}

/* ----------------- People Card ----------------- */
export const PeopleCard = forwardRef(({ person, removeCard }, ref) => {
  const apiFetch = useApi();
  const router = useRouter();
  const { user } = useAuth();
  const menuRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const personType = getUserActionType(person, user);
  const config = ACTION_CONFIG[personType];

  if (!config || personType === "self") return null; // hide buttons for self

  /* -------- Close menu on outside click -------- */
  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenu(false);
    };
    if (openMenu) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  /* -------- API Action Handler -------- */
  const runAction = async (action) => {
    setLoading(true);

    if (action === "reject_request" || action === "block") removeCard();

    try {
      let payload, notifRes;
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
          notifRes = await apiFetch("/api/add-notification", {
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
      setOpenMenu(false);
    }
  };

  return (
    <div className="people-card" ref={ref}>
      {/* MENU */}
      {config.menu.length > 0 && (
        <button
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu((prev) => !prev);
          }}
        >
          <MoreHorizRoundedIcon />
        </button>
      )}
      {openMenu && (
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
      {/* BUTTONS */}
      <div className="card-buttons">
        {/* FRIENDSHIP BUTTON */}
        {person.friendship_status === "none" && (
          <Button disabled={loading} onClick={() => runAction("send_request")}>
            {loading ? "Requesting..." : "Add Friend"}
          </Button>
        )}

        {person.friendship_status === "request_sent" && (
          <Button
            disabled={loading}
            onClick={() => runAction("cancel_request")}
          >
            {loading ? "Cancelling..." : "Cancel Request"}
          </Button>
        )}

        {person.friendship_status === "request_received" && (
          <>
            <Button
              disabled={loading}
              onClick={() => runAction("accept_request")}
            >
              {loading ? "Accepting..." : "Accept"}
            </Button>

            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => runAction("reject_request")}
            >
              {loading ? "Rejecting..." : "Reject"}
            </Button>
          </>
        )}

        {person.friendship_status === "friends" && (
          <Button disabled={loading} onClick={() => runAction("unfriend")}>
            {loading ? "Processing..." : "Friends"}
          </Button>
        )}

        {/* FOLLOW BUTTON */}
        {person.following_status === "not_following" && (
          <Button
            disabled={loading}
            onClick={() => runAction("follow")}
            variant="outlined"
          >
            {loading ? "Following..." : "Follow"}
          </Button>
        )}

        {person.following_status === "following" && (
          <Button
            disabled={loading}
            onClick={() => runAction("unfollow")}
            variant="outlined"
          >
            {loading ? "Unfollowing..." : "Following"}
          </Button>
        )}
      </div>
    </div>
  );
});

PeopleCard.displayName = "PeopleCard";
