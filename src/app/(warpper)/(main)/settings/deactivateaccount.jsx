"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import "../../../css/deactivate-account.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function DeactivateAccount({ onBack }) {
  const { user: authUser, logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const apiFetch = useApi();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeactivateAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    setShowConfirmation(false);

    try {
      // Call the deactivate API
      const res = await apiFetch("/api/deactivate-user", {
        method: "POST",
        body: {
          user_id: authUser?.user_id,
          deactivate: 1 // 1 means deactivate
        },
      });

      if (res.status) {
        // Show success message
        setDeleteSuccess(true);
        showSnackbar({
          title: "Account Deactivated",
          message: "Your account has been deactivated successfully",
          variant: "success",
          duration: 5000,
        });

        // Logout user after successful deactivation
        setTimeout(() => {
          logout();
          // If there's a callback to go back, call it
          if (onBack) {
            onBack();
          }
        }, 3000);
        
      } else {
        throw new Error(res.message || "Failed to deactivate account");
      }
      
    } catch (error) {
      console.error("Error deactivating account:", error);
      setDeleteError(error.message);
      showSnackbar({
        title: "Deactivation Failed",
        message: error.message || "Failed to deactivate account",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  const warningItems = [
    "Your profile will be hidden from other users",
    "You won't be able to access your account",
    "Your data will be preserved for 30 days",
    "You can reactivate your account within 30 days by contacting support"
  ];

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-wrapper">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="back-button"
          disabled={isDeleting || deleteSuccess}
          type="button"
        >
           <ArrowBackIosIcon fontSize="small" />
        </button>

        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Deactivate Account</h1>
          <p className="profile-subtitle">Temporarily disable your account</p>
        </div>

        {/* Success/Error Messages */}
        {deleteSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <span>Your account has been deactivated! You will be logged out shortly.</span>
          </div>
        )}
        
        {deleteError && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{deleteError}</span>
          </div>
        )}

        {/* Warning Card */}
        <div className="profile-card" style={{ borderColor: "#f59e0b" }}>
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-exclamation-triangle" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
              What Happens When You Deactivate
            </h2>
            <p className="card-description">
              Your account will be temporarily disabled
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
                  <i className="fas fa-info-circle" style={{ color: "#3b82f6", marginTop: "0.25rem" }}></i>
                  <span style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        

        {/* Deactivate Form Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-user-slash" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
              Deactivate Your Account
            </h2>
            <p className="card-description">
              If you're certain about deactivating your account, proceed below
            </p>
          </div>
          <div className="card-content">
            {/* Final Warning */}
            <div style={{ 
              backgroundColor: "#0f172a", 
              borderLeft: "3px solid #f59e0b",
              padding: "1rem",
              marginBottom: "1.5rem",
              borderRadius: "0 0.375rem 0.375rem 0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <i className="fas fa-exclamation-triangle" style={{ color: "#f59e0b" }}></i>
                <div>
                  <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.875rem" }}>Important Notice</div>
                  <div style={{ color: "#cbd5e1", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                    You can reactivate your account within 30 days by contacting support
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="edit-buttons visible">
              <button
                type="button"
                className="edit-button cancel"
                onClick={onBack}
                disabled={isDeleting || deleteSuccess}
              >
                <i className="fas fa-arrow-left"></i>
                Cancel
              </button>
              <button
                type="button"
                className="edit-button save"
                onClick={() => setShowConfirmation(true)}
                disabled={isDeleting || deleteSuccess}
                style={{ 
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderColor: "transparent"
                }}
              >
                <i className="fas fa-user-slash"></i>
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="card-header" style={{ borderBottomColor: "#f59e0b" }}>
              <h3 className="card-title">
                <i className="fas fa-exclamation-triangle" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
                Confirm Deactivation
              </h3>
              <p className="card-description" style={{ color: "#f59e0b" }}>
                Are you sure you want to deactivate your account?
              </p>
            </div>
            <div className="card-content">
              <div style={{ 
                backgroundColor: "#1e293b", 
                border: "1px solid #f59e0b", 
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1.5rem"
              }}>
                <p style={{ color: "#ffffff", textAlign: "center", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Your account will be temporarily disabled
                </p>
                <p style={{ color: "#f59e0b", textAlign: "center", fontSize: "0.875rem" }}>
                  You will be logged out immediately after deactivation
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
                  onClick={handleDeactivateAccount}
                  disabled={isDeleting}
                  style={{ 
                    flex: 1,
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderColor: "transparent"
                  }}
                >
                  {isDeleting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Deactivating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-slash"></i>
                      Yes, Deactivate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}