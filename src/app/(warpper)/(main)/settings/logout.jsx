"use client";

import { useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";


export default function LogoutSettings({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    
    // Clear all authentication data from localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force full page reload to clear all React state and go to login
    window.location.href = "/login";
  };

  const confirmLogout = () => {
    setShowConfirmation(false);
    handleLogout();
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-wrapper">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="back-button"
          disabled={isLoading}
          type="button"
        >
          <ArrowBackIosIcon fontSize="small" />
        </button>

        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Logout</h1>
          <p className="profile-subtitle">Sign out from your account</p>
        </div>

        {/* Logout Card */}
        <div className="profile-card" style={{ borderColor: "#ef4444" }}>
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-sign-out-alt" style={{ color: "#ef4444", marginRight: "0.5rem" }}></i>
              Confirm Logout
            </h2>
            <p className="card-description">
              You are about to sign out from your account
            </p>
          </div>
          
          <div className="card-content">
            {/* Warning Message */}
            <div style={{ 
              backgroundColor: "#1e293b", 
              border: "1px solid #ef4444",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              <i className="fas fa-sign-out-alt" style={{ 
                color: "#ef4444", 
                fontSize: "2.5rem",
                marginBottom: "1rem"
              }}></i>
              <p style={{ color: "#ffffff", fontWeight: "600", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                You will be redirected to the login page
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                All your session data will be cleared
              </p>
            </div>

            {/* Action Buttons */}
            <div className="edit-buttons visible" style={{ gap: "1rem" }}>
              <button
                type="button"
                className="edit-button cancel"
                onClick={onBack}
                disabled={isLoading}
                style={{ flex: 1 }}
              >
                <i className="fas fa-arrow-left"></i>
                Go Back
              </button>
              <button
                type="button"
                className="edit-button save"
                onClick={() => setShowConfirmation(true)}
                disabled={isLoading}
                style={{ 
                  flex: 1,
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  borderColor: "transparent"
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="card-content" style={{ padding: "2rem" }}>
              <div style={{ 
                textAlign: "center",
                marginBottom: "2rem"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem"
                }}>
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <h3 style={{ 
                  color: "#ffffff", 
                  fontSize: "1.25rem", 
                  fontWeight: "600",
                  marginBottom: "0.5rem"
                }}>
                  Are you sure?
                </h3>
                <p style={{ color: "#94a3b8" }}>
                  You will be signed out and redirected to the login page
                </p>
              </div>

              <div className="modal-actions" style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className="edit-button cancel"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="edit-button save"
                  onClick={confirmLogout}
                  disabled={isLoading}
                  style={{ 
                    flex: 1,
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    borderColor: "transparent"
                  }}
                >
                  <i className="fas fa-check"></i>
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}