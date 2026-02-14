"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/navigation";
import Image from "next/image";

const UserBlockList = () => {
    const { user: authUser } = useAuth();
    const { showSnackbar } = useSnackbar();
    const apiFetch = useApi();
    const router = useRouter();

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [unblockingId, setUnblockingId] = useState(null);
    const [showUnblockConfirm, setShowUnblockConfirm] = useState(null);

    // Fetch blocked users
    const fetchBlockedUsers = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            const res = await apiFetch(`/api/getBlock-lists?page=${page}`, {
                method: "GET",
            });

            if (res.status) {
                // The API now returns user details directly
                setBlockedUsers(res.data || []);
                setCurrentPage(res.current_page || 1);
                setTotalPages(res.total_pages || 1);
                setTotalRecords(res.total_records || 0);
            } else {
                setError(res.message || "Failed to fetch blocked users");
                setBlockedUsers([]);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            setError(error.message || "Network error. Please try again.");
            showSnackbar({
                title: "Error",
                message: "Failed to load blocked users",
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (authUser?.user_id) {
            fetchBlockedUsers(1);
        }
    }, [authUser]);

    // Show unblock confirmation
    const handleUnblockClick = (userId) => {
        setShowUnblockConfirm(userId);
    };

    // Cancel unblock
    const cancelUnblock = () => {
        setShowUnblockConfirm(null);
    };

    // Confirm unblock
    const confirmUnblock = async (userId) => {
        setUnblockingId(userId);
        setError("");
        setShowUnblockConfirm(null);

        try {
            const res = await apiFetch("/api/unblock", {
                method: "POST",
                body: {
                    unblocked_user: parseInt(userId)
                },
            });

            if (res.status) {
                // Remove unblocked user from list
                setBlockedUsers(prev => prev.filter(user => user.blocked_user_id.toString() !== userId));
                setTotalRecords(prev => prev - 1);

                showSnackbar({
                    title: "User Unblocked",
                    message: res.message || "User has been unblocked successfully",
                    variant: "success",
                });

                // If current page becomes empty and not first page, go to previous page
                if (blockedUsers.length === 1 && currentPage > 1) {
                    fetchBlockedUsers(currentPage - 1);
                }
            } else {
                throw new Error(res.message || "Failed to unblock user");
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
            setError(error.message);
            showSnackbar({
                title: "Unblock Failed",
                message: error.message || "Failed to unblock user",
                variant: "error",
            });
        } finally {
            setUnblockingId(null);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchBlockedUsers(newPage);
        }
    };

    // Get user initials for avatar fallback
    const getUserInitials = (name) => {
        if (!name) return "U";
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "Invalid date";
        }
    };

    return (
        <div className="block-list-container">
            <div className="block-list-wrapper">
                {/* Header with Back Button */}
                <div className="page-header">
                    <button
                        onClick={() => router.back()}
                        className="back-button"
                        disabled={loading}
                        type="button"
                    >
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className="page-name">Blocked Users</span>
                </div>

                {/* Unblock Confirmation Modal */}
                {showUnblockConfirm && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <i className="fas fa-shield-alt" style={{ marginRight: "0.5rem", color: "#3b82f6" }}></i>
                                    Unblock User
                                </h3>
                                <p className="card-description">
                                    Are you sure you want to unblock this user?
                                </p>
                            </div>
                            <div className="card-content">
                                <div style={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #3b82f6",
                                    borderRadius: "0.5rem",
                                    padding: "1rem",
                                    marginBottom: "1.5rem"
                                }}>
                                    <p style={{ textAlign: "center", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                        This user will be able to:
                                    </p>
                                    <ul style={{
                                        listStyle: "none",
                                        padding: "0",
                                        margin: 0,
                                        fontSize: "0.875rem"
                                    }}>
                                        <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <i className="fas fa-check" style={{ color: "#10b981" }}></i>
                                            View your profile
                                        </li>
                                        <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <i className="fas fa-check" style={{ color: "#10b981" }}></i>
                                            Follow you again
                                        </li>
                                        <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <i className="fas fa-check" style={{ color: "#10b981" }}></i>
                                            Interact with your content
                                        </li>
                                    </ul>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="edit-button cancel"
                                        onClick={cancelUnblock}
                                        disabled={unblockingId === showUnblockConfirm}
                                        style={{ flex: 1 }}
                                    >
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-button save"
                                        onClick={() => confirmUnblock(showUnblockConfirm)}
                                        disabled={unblockingId === showUnblockConfirm}
                                        style={{
                                            flex: 1,
                                            background: "#3b82f6",
                                            borderColor: "#2563eb"
                                        }}
                                    >
                                        {unblockingId === showUnblockConfirm ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Unblocking...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-shield-alt"></i>
                                                Yes, Unblock
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="profile-card" style={{ borderColor: "#ef4444", marginBottom: "1.5rem" }}>
                        <div className="card-content" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#ef4444" }}>
                                <i className="fas fa-exclamation-circle"></i>
                                <span style={{ fontSize: "0.875rem" }}>{error}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Card */}
                <div className="profile-card" style={{ marginBottom: "1.5rem" }}>
                    <div className="card-content" style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fas fa-ban" style={{ color: "#ef4444" }}></i>
                                <span style={{ fontWeight: "600" }}>Blocked Users</span>
                            </div>
                            <div style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.875rem",
                                fontWeight: "600"
                            }}>
                                {totalRecords}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blocked Users List */}
                <div className="space-y-4">
                    {loading && blockedUsers.length === 0 ? (
                        <div className="profile-card">
                            <div className="card-content" style={{ padding: "3rem", textAlign: "center" }}>
                                <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#3b82f6", marginBottom: "1rem" }}></i>
                                <p style={{ color: "#94a3b8" }}>Loading blocked users...</p>
                            </div>
                        </div>
                    ) : blockedUsers.length === 0 ? (
                        <div className="profile-card">
                            <div className="card-content" style={{ padding: "3rem", textAlign: "center" }}>
                                <i className="fas fa-shield-alt" style={{ fontSize: "3rem", color: "#475569", marginBottom: "1rem" }}></i>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                                    No Blocked Users
                                </h3>
                                <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                                    You haven't blocked anyone yet
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {blockedUsers.map((user) => (
                                <div
                                    key={user.blocked_user_id}
                                    className="profile-card"
                                    style={{
                                        borderColor: "rgba(239, 68, 68, 0.3)",
                                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                                        position: "relative"
                                    }}
                                >
                                    <div className="card-content" style={{ padding: "1.5rem" }}>
                                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                            {/* Avatar */}
                                            <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                                                {user.avatar ? (
                                                    <Image
                                                        src={user.avatar}
                                                        alt={user.name || "User"}
                                                        width={64}
                                                        height={64}
                                                        style={{
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            opacity: 0.6
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: "64px",
                                                        height: "64px",
                                                        borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "1.25rem",
                                                        fontWeight: "600",
                                                        color: "white",
                                                        opacity: 0.6
                                                    }}>
                                                        {user.name ? getUserInitials(user.name) : "U"}
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div style={{ flex: 1, minWidth: "200px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                                                    <h3 style={{ fontWeight: "600", fontSize: "1.125rem", margin: 0 }}>
                                                        {user.name || "Unknown User"}
                                                    </h3>
                                                    <span style={{
                                                        backgroundColor: "#ef4444",
                                                        color: "white",
                                                        padding: "0.125rem 0.5rem",
                                                        borderRadius: "9999px",
                                                        fontSize: "0.75rem",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem"
                                                    }}>
                                                        <i className="fas fa-ban" style={{ fontSize: "0.625rem" }}></i>
                                                        Blocked
                                                    </span>
                                                </div>
                                                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                                    {user.username ? `@${user.username}` : `@user${user.blocked_user_id}`}
                                                </p>
                                                {user.bio && (
                                                    <p style={{ color: "#94a3b8", fontSize: "0.875rem", opacity: 0.6, margin: "0 0 0.5rem 0" }}>
                                                        {user.bio}
                                                    </p>
                                                )}
                                                <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                                                    Blocked on {formatDate(user.created_at)}
                                                </p>
                                            </div>

                                            {/* Unblock Button */}
                                            <button
                                                type="button"
                                                className="edit-button save"
                                                onClick={() => handleUnblockClick(user.blocked_user_id.toString())}
                                                disabled={unblockingId === user.blocked_user_id.toString()}
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    fontSize: "0.875rem",
                                                    background: "transparent",
                                                    border: "1px solid #3b82f6",
                                                    color: "#3b82f6",
                                                    flexShrink: 0,
                                                    alignSelf: "flex-start"
                                                }}
                                            >
                                                {unblockingId === user.blocked_user_id.toString() ? (
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-shield-alt"></i>
                                                        Unblock
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    marginTop: "2rem",
                                    flexWrap: "wrap"
                                }}>
                                    <button
                                        type="button"
                                        className="edit-button cancel"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        style={{ padding: "0.5rem 1rem" }}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                        Previous
                                    </button>
                                    <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="edit-button cancel"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                        style={{ padding: "0.5rem 1rem" }}
                                    >
                                        Next
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserBlockList;