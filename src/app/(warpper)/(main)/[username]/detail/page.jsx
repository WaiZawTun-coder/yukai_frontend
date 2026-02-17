"use client";

import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import { socket } from "@/utilities/socket";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Popup from "@/components/ui/Popup";
import Select from "@/components/ui/Select";

const UserDetailPage = () => {
  const { user: authUser } = useAuth();
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiFetch = useApi();
  const { showSnackbar } = useSnackbar();
  const [onlineStatus, setOnlineStatus] = useState({
    online: false,
    lastSeen: null,
  });

  const { username } = useParams();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [blockPopupOpen, setBlockPopupOpen] = useState(false);
  const [reportPopupOpen, setReportPopupOpen] = useState(false);
  const [reportType, setReportType] = useState("fake_account"); // default type

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const confirmBlockUser = () => setBlockPopupOpen(true);
  const confirmReportUser = () => setReportPopupOpen(true);

  const handleBlockUser = async () => {
    setBlockPopupOpen(false);
    const res = await apiFetch("/api/block-user", {
      method: "POST",
      body: { blocked_user_id: user.user_id },
    });
    if (res.status) {
      showSnackbar({
        title: "Blocked",
        message: `You blocked ${user.display_name}`,
        variant: "info",
      });
    }
  };

  const handleReportUser = async () => {
    setReportPopupOpen(false);
    const res = await apiFetch("/api/report-account", {
      method: "POST",
      body: { reported_user: user.user_id, type: reportType },
    });
    if (res.status) {
      showSnackbar({
        title: "Reported",
        message: `You reported ${user.display_name} as ${reportType.replace("_", " ")}`,
        variant: "info",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-container")) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (let key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval > 1) return `${interval} ${key}s ago`;
      if (interval === 1) return `1 ${key} ago`;
    }
    return "just now";
  };

  const canViewPrivate = authUser?.user_id === user?.user_id;

  // Fetch user data
  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/get-user?username=${username}`);

        if (!res.status) {
          showSnackbar({
            title: "Failed to fetch user data",
            message: "Unable to get user data with username - " + username,
            variant: "error",
          });
          setLoading(false);
          return;
        }

        const userData = res.data; // adjust if your API returns "data"

        setuser(userData);

        // Initialize online status
        const isRecentlyActive = (lastSeen) => {
          if (!lastSeen) return false;
          return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
        };

        setOnlineStatus({
          online: userData.is_active || isRecentlyActive(userData.last_seen),
          lastSeen: userData.last_seen ? timeAgo(userData.last_seen) : null,
        });
      } catch (err) {
        console.error("Fetch user error:", err);
        showSnackbar({
          title: "Error",
          message: "Something went wrong while fetching user.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  // Socket listeners for real-time status
  useEffect(() => {
    if (!user?.user_id) return;

    const handleOnline = ({ userId }) => {
      if (String(userId) === String(user.user_id)) {
        setOnlineStatus({ online: true, lastSeen: null });
      }
    };

    const handleOffline = ({ userId, lastSeen }) => {
      if (String(userId) === String(user.user_id)) {
        setOnlineStatus({ online: false, lastSeen: timeAgo(lastSeen) });
      }
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);

    return () => {
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
    };
  }, [user?.user_id]);

  if (loading) return <div className="loading">Loading user...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-detail-container">
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowBackIosIcon fontSize="small" />
        </button>
        <span className="page-name">{user.display_name}&apos;s Detail</span>

        {authUser.username !== user.username && (
          <div className="menu-container">
            <button className="menu-button" onClick={toggleMenu}>
              ⋮
            </button>

            {menuOpen && (
              <div className="menu-dropdown">
                <button onClick={confirmReportUser}>Report User</button>
                <button onClick={confirmBlockUser}>Block User</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="user-card header-card">
        <Image
          src={
            user.profile_image
              ? `/api/images?url=${user.profile_image}`
              : `/Images/default-profiles/${user.gender}.jpg`
          }
          alt="Profile"
          className="profile-image"
          width={110}
          height={110}
        />
        <div className="header-info">
          <h2>{user.display_name}</h2>
          <p className="username">@{user.username}</p>

          <div className="status-row">
            <span
              className={`status-dot ${onlineStatus.online ? "online" : "offline"}`}
            />
            <span>
              {onlineStatus.online
                ? "Online"
                : onlineStatus.lastSeen
                  ? `Last seen ${onlineStatus.lastSeen}`
                  : "Offline"}
            </span>
          </div>

          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      {/* Stats Section */}
      <div className="user-card stats-card">
        <div className="stat">
          <h3>{user.follower_count}</h3>
          <p>Followers</p>
        </div>
        <div className="stat">
          <h3>{user.following_count}</h3>
          <p>Following</p>
        </div>
        <div className="stat">
          <h3>{user.friends_count}</h3>
          <p>Friends</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="user-card info-card">
        <h3>Personal Information</h3>

        <div className="info-row">
          <span>Full Name</span>
          <span>{user.display_name}</span>
        </div>

        <div className="info-row">
          <span>Gender</span>
          <span>{user.gender}</span>
        </div>

        {user.birthday && (
          <div className="info-row">
            <span>Birthday</span>
            <span>
              {new Date(user.birthday).toDateString()} (
              {calculateAge(user.birthday)} yrs)
            </span>
          </div>
        )}

        {canViewPrivate && user.email && (
          <div className="info-row">
            <span>Email</span>
            <span>{user.email}</span>
          </div>
        )}

        {canViewPrivate && user.phone_number && (
          <div className="info-row">
            <span>Phone</span>
            <span>{user.phone_number}</span>
          </div>
        )}

        {user.location && (
          <div className="info-row">
            <span>Location</span>
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {/* Relationship Section */}
      {/* {authUser?.user_id !== user.user_id && (
                <div className="user-card relationship-card">
                    <h3>Relationship</h3>
                    <p>Status: {user.friend_status}</p>
                    <p>Following: {user.is_following ? "Yes" : "No"}</p>
                    <p>Request: {user.request_direction}</p>
                </div>
            )} */}

      {/* Block Confirmation Popup */}
      <Popup
        isOpen={blockPopupOpen}
        onClose={() => setBlockPopupOpen(false)}
        title="Block User?"
        footer={
          <div className="popup-actions">
            <button
              onClick={() => setBlockPopupOpen(false)}
              className="popup-btn popup-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleBlockUser}
              className="popup-btn popup-btn-danger"
            >
              Block
            </button>
          </div>
        }
      >
        <p>Are you sure you want to block {user.display_name}?</p>
      </Popup>

      {/* Report User Popup */}
      <Popup
        isOpen={reportPopupOpen}
        onClose={() => setReportPopupOpen(false)}
        title="Report User"
        footer={
          <div className="popup-actions">
            <button
              onClick={() => setReportPopupOpen(false)}
              className="popup-btn popup-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleReportUser}
              className="popup-btn popup-btn-danger"
            >
              Report
            </button>
          </div>
        }
      >
        <p>Select reason for reporting {user.display_name}:</p>
        <Select
          options={[
            { value: "fake_account", label: "Fake Account" },
            { value: "spam", label: "Spam" },
            { value: "harassment", label: "Harassment" },
            { value: "impersonation", label: "Impersonation" },
            { value: "other", label: "other" },
          ]}
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        />
      </Popup>
    </div>
  );
};

export default UserDetailPage;
