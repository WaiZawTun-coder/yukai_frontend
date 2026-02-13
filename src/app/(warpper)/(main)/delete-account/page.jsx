"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/navigation";

const DeleteAccount = ({ }) => {
    const { user: authUser, logout } = useAuth();
    const { showSnackbar } = useSnackbar();
    const apiFetch = useApi();

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [finalConfirmation, setFinalConfirmation] = useState(false);

    const router = useRouter();

    const handleDeleteAccount = () => {
        // Show first confirmation
        setShowConfirmation(true);
    };

    const confirmFirstStep = () => {
        setShowConfirmation(false);
        setFinalConfirmation(true);
    };

    const confirmFinalDelete = async () => {
        setIsDeleting(true);
        setDeleteError("");
        setFinalConfirmation(false);

        try {
            // Call the delete account API
            const res = await apiFetch("/api/deleted-account", {
                method: "POST",
                body: {
                    user_id: authUser?.user_id,
                    deleted_account: 1 // 1 means delete account
                },
            });

            if (res.status) {
                // Show success message
                setDeleteSuccess(true);
                showSnackbar({
                    title: "Account Deleted",
                    message: "Your account has been permanently deleted",
                    variant: "success",
                    duration: 5000,
                });

                // Logout user after successful deletion
                setTimeout(() => {
                    logout();
                }, 3000);

            } else {
                throw new Error(res.message || "Failed to delete account");
            }

        } catch (error) {
            console.error("Error deleting account:", error);
            setDeleteError(error.message);
            showSnackbar({
                title: "Deletion Failed",
                message: error.message || "Failed to delete account",
                variant: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
        setFinalConfirmation(false);
    };

    const warningItems = [
        "All your personal data will be permanently deleted",
        "Your account cannot be recovered after deletion",
        "All associated content and settings will be lost",
        "This action will take effect immediately"
    ];

    const lossItems = [
        { icon: "fa-user-circle", title: "Profile & Identity", description: "Your username, profile picture, bio, and personal details" },
        { icon: "fa-history", title: "Activity History", description: "All your posts, comments, likes, and interaction history" },
        { icon: "fa-cog", title: "Settings & Preferences", description: "All customized settings and saved preferences" },
        { icon: "fa-cloud-upload-alt", title: "Uploaded Content", description: "All photos, videos, documents, and uploaded files" }
    ];



    return (
        <div className="delete-account-container">
            <div className="delete-account-wrapper">

                <div className="page-header">
                    {/* Back Button */}
                    <button
                        onClick={router.back}
                        className="back-button"
                        disabled={isDeleting || deleteSuccess}
                        type="button"
                    >
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    {/* Header */}
                    <span className="page-name">Account Deletion</span>
                </div>

                {/* First Confirmation Modal */}
                {showConfirmation && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
                                    Are you sure you want to proceed?
                                </h3>
                                <p className="card-description">
                                    You&apos;re about to start the account deletion process
                                </p>
                            </div>
                            <div className="card-content">
                                <div style={{
                                    // backgroundColor: "#1e293b",
                                    border: "1px solid #ef4444",
                                    borderRadius: "0.5rem",
                                    padding: "1rem",
                                    marginBottom: "1.5rem"
                                }}>
                                    <p style={{ textAlign: "center", fontWeight: "600", marginBottom: "0.5rem" }}>
                                        Warning: This action is permanent
                                    </p>
                                    <p style={{ textAlign: "center", fontSize: "0.875rem" }}>
                                        You will lose access to all your data
                                    </p>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="edit-button cancel"
                                        onClick={cancelDelete}
                                        disabled={isDeleting}
                                        style={{ flex: 1 }}
                                    >
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-button save"
                                        onClick={confirmFirstStep}
                                        disabled={isDeleting}
                                        style={{
                                            flex: 1,
                                            background: "#ef4444",
                                            borderColor: "#dc2626"
                                        }}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                        Continue to Final Step
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Confirmation Modal */}
                {finalConfirmation && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className="card-header" style={{ borderBottomColor: "#ef4444" }}>
                                <h3 className="card-title">
                                    <i className="fas fa-skull-crossbones" style={{ marginRight: "0.5rem" }}></i>
                                    Final Confirmation
                                </h3>
                                <p className="card-description">
                                    This is your last chance to keep your account
                                </p>
                            </div>
                            <div className="card-content">
                                <div style={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #ef4444",
                                    borderRadius: "0.5rem",
                                    padding: "1rem",
                                    marginBottom: "1.5rem"
                                }}>
                                    <p style={{ textAlign: "center", fontWeight: "600", marginBottom: "0.5rem" }}>
                                        Are you absolutely sure you want to delete your account?
                                    </p>
                                    <p style={{ textAlign: "center", fontSize: "0.875rem" }}>
                                        This action <strong>cannot</strong> be undone!
                                    </p>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="edit-button cancel"
                                        onClick={cancelDelete}
                                        disabled={isDeleting}
                                        style={{ flex: 1 }}
                                    >
                                        <i className="fas fa-times"></i>
                                        No, Keep My Account
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-button save"
                                        onClick={confirmFinalDelete}
                                        disabled={isDeleting}
                                        style={{
                                            flex: 1,
                                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                            borderColor: "transparent"
                                        }}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-trash-alt"></i>
                                                Yes, Delete Permanently
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning Card */}
                <div className="profile-card" style={{ borderColor: "#ef4444" }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-radiation-alt" style={{ marginRight: "0.5rem" }}></i>
                            Warning: This action is irreversible
                        </h3>
                        <p className="card-description">
                            Once deleted, your account cannot be recovered
                        </p>
                    </div>
                    <div className="card-content">
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {warningItems.map((item, index) => (
                                <li key={index} style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.75rem",
                                    marginBottom: "0.75rem",
                                    paddingBottom: "0.75rem",
                                    borderBottom: index < warningItems.length - 1 ? "1px solid #334155" : "none"
                                }}>
                                    <i className="fas fa-times" style={{ marginTop: "0.25rem" }}></i>
                                    <span style={{ fontSize: "0.875rem" }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* What You'll Lose Card */}
                <div className="profile-card" style={{ borderColor: "#f59e0b" }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-exclamation-circle" style={{ marginRight: "0.5rem" }}></i>
                            What You&apos;ll Lose Forever
                        </h3>
                        <p className="card-description">
                            All this data will be permanently deleted
                        </p>
                    </div>
                    <div className="card-content">
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {lossItems.map((item, index) => (
                                <div key={index} style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.75rem",
                                    padding: "0.75rem",
                                    backgroundColor: "rgba(245, 158, 11, 0.05)",
                                    borderRadius: "0.5rem",
                                    border: "1px solid rgba(245, 158, 11, 0.2)"
                                }}>
                                    <i className={`fas ${item.icon}`} style={{ marginTop: "0.125rem" }}></i>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "0.125rem" }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: "0.75rem" }}>
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Delete Form Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fas fa-trash-alt" style={{ marginRight: "0.5rem" }}></i>
                            Delete Your Account
                        </h3>
                        <p className="card-description">
                            If you&apos;re certain about deleting your account, proceed below
                        </p>
                    </div>
                    <div className="card-content">
                        {/* Final Warning */}
                        <div style={{
                            borderLeft: "3px solid #ef4444",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            borderRadius: "0 0.375rem 0.375rem 0"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <i className="fas fa-exclamation-triangle"></i>
                                <div>
                                    <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>This is your final warning</div>
                                    <div style={{ fontSize: "0.75rem", marginTop: "0.125rem" }}>
                                        Once deleted, there is NO way to recover your account or any data
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="edit-buttons">
                            <button
                                type="button"
                                className="edit-button cancel"
                                onClick={router.back}
                                disabled={isDeleting || deleteSuccess}
                            >
                                <i className="fas fa-arrow-left"></i>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="edit-button save"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteSuccess}
                                style={{
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    borderColor: "transparent"
                                }}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;