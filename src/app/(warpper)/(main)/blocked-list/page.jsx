"use client";

import Popup from "@/components/ui/Popup";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Image from "next/image";
import { useEffect, useState } from "react";

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);

  const apiFetch = useApi();

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await apiFetch("/api/get-blocked-users");
      setBlockedUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load blocked users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!selectedUser) return;

    const userId = selectedUser.user_id;
    setProcessingId(userId);

    try {
      const data = await apiFetch("/api/unblock", {
        method: "POST",
        body: { user_id: userId },
      });

      if (data.status) {
        setBlockedUsers((prev) =>
          prev.filter((user) => user.user_id !== userId),
        );
        setOpenPopup(false);
        setSelectedUser(null);
      } else {
        alert(data.message || "Failed to unblock user");
      }
    } catch (err) {
      console.error("Unblock failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="blocked-container">
      <div className="page-header">
        <button onClick={() => {}} className="back-button" disabled={loading}>
          <ArrowBackIosIcon fontSize="small" />
        </button>

        <span className="page-name">Change Email Address</span>
      </div>

      {loading ? (
        <p className="info-text">Loading blocked users...</p>
      ) : blockedUsers.length === 0 ? (
        <p className="info-text">You have not blocked anyone.</p>
      ) : (
        <div className="blocked-list">
          {blockedUsers.map((user) => (
            <div key={user.user_id} className="blocked-card">
              <div className="blocked-user-info">
                <Image
                  src={
                    user.profile_image
                      ? `/api/images?url=${user.profile_image}`
                      : `/Images/default-profiles/${user.gender}.jpg`
                  }
                  alt="avatar"
                  className="blocked-avatar"
                  width={48}
                  height={48}
                />
                <div>
                  <p className="blocked-name">{user.display_name}</p>
                  <p className="blocked-username">@{user.username}</p>
                </div>
              </div>

              <button
                className="unblock-btn"
                disabled={processingId === user.user_id}
                onClick={() => {
                  setSelectedUser(user);
                  setOpenPopup(true);
                }}
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Popup */}
      <Popup
        isOpen={openPopup}
        onClose={() => {
          setOpenPopup(false);
          setSelectedUser(null);
        }}
        title={
          selectedUser
            ? `Are you sure you want to unblock ${selectedUser.display_name}?`
            : ""
        }
        footer={
          <div className="popup-actions">
            <button
              className="popup-btn popup-btn-danger"
              onClick={handleUnblock}
              disabled={processingId}
            >
              {processingId ? "Unblocking..." : "Unblock"}
            </button>
            <button
              className="popup-btn popup-btn-cancel"
              onClick={() => {
                setOpenPopup(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </button>
          </div>
        }
      >
        <p>This user will be able to interact with you again.</p>
      </Popup>
    </div>
  );
};

export default BlockedUsers;
