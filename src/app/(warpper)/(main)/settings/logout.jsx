"use client";

import { useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function LogoutSettings({ onBack }) {
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // Fixed: Changed to showConfirmation
  const [logoutError, setLogoutError] = useState("");
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    lastLogin: "February 9, 2026 at 10:30 AM",
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setLogoutError("");
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (logoutAllDevices) {
        setLogoutSuccess("✅ Logged out from all devices successfully");
      } else {
        setLogoutSuccess("✅ Logged out successfully");
      }
      
      if (clearData) {
        // Clear local data
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Reset form and go back after delay
      setTimeout(() => {
        setShowConfirmation(false);
        setIsLoading(false);
        
        // In a real app, redirect to login page
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Error logging out:", error);
      setLogoutError("Failed to logout. Please try again.");
      setIsLoading(false);
    }
  };

  const confirmLogout = async () => {
    setShowConfirmation(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setShowConfirmation(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const warningItems = [
    "You will be signed out of your current session",
    "You'll need to sign in again to access your account",
    "Any unsaved work will be lost",
    logoutAllDevices && "All active sessions on other devices will be terminated",
    clearData && "All local data and preferences will be cleared"
  ].filter(Boolean);

  const activeSessions = [
    { device: "Chrome on Windows", location: "New York, US", status: "active", time: "Current session", icon: "fa-desktop" },
    { device: "Safari on iPhone", location: "New York, US", status: "idle", time: "2 hours ago", icon: "fa-mobile" }
  ];

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-wrapper">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="back-button"
          disabled={isLoading || logoutSuccess}
          type="button"
        >
           <ArrowBackIosIcon fontSize="small" />
        </button>

        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Logout Settings</h1>
          <p className="profile-subtitle">Manage your session and logout preferences</p>
        </div>

        {/* Success/Error Messages */}
        {logoutSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <span>{logoutSuccess}</span>
          </div>
        )}
        
        {logoutError && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{logoutError}</span>
          </div>
        )}

        {/* Current Session Card */}
        <div className="profile-card" style={{ borderColor: "#3b82f6" }}>
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-user-circle" style={{ color: "#3b82f6", marginRight: "0.5rem" }}></i>
              Current Session
            </h2>
            <p className="card-description">
              Account information and session details
            </p>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "600"
              }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "1.125rem" }}>
                  {user.name}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {user.email}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Last login: {user.lastLogin}
                </div>
              </div>
              <div style={{ 
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "0.375rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem"
              }}>
                <i className="fas fa-check-circle"></i>
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-mobile-alt" style={{ color: "#8b5cf6", marginRight: "0.5rem" }}></i>
              Active Sessions
            </h2>
            <p className="card-description">
              Devices where you're currently logged in
            </p>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeSessions.map((session, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    backgroundColor: session.status === "active" ? "#1e293b" : "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    gap: "1rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      backgroundColor: session.status === "active" ? "#3b82f6" : "#6b7280",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "16px"
                    }}>
                      <i className={`fas ${session.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ color: "#ffffff", fontWeight: "500", fontSize: "0.875rem" }}>
                        {session.device}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                        {session.time} • {session.location}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: session.status === "active" ? "#10b981" : "#6b7280",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "500"
                  }}>
                    {session.status === "active" ? "Active" : "Idle"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Options Card */}
        <div className="profile-card" style={{ borderColor: "#f59e0b" }}>
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-shield-alt" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
              Logout Options
            </h2>
            <p className="card-description">
              Configure your logout preferences
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit}>
              {/* Logout from all devices */}
              

              

              {/* Warning Section */}
              <div style={{ 
                backgroundColor: "#0f172a", 
                borderLeft: "3px solid #ef4444",
                padding: "1rem",
                marginTop: "1.5rem",
                marginBottom: "1.5rem",
                borderRadius: "0 0.375rem 0.375rem 0"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444", marginTop: "0.125rem" }}></i>
                  <div>
                    <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.875rem" }}>Important</div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                      When you logout, you will be signed out of your account
                      {logoutAllDevices && " on all devices"}. You'll need to sign in again to access your account.
                    </div>
                  </div>
                </div>
              </div>

              {/* What happens list */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                  <i className="fas fa-info-circle" style={{ color: "#3b82f6", marginRight: "0.5rem" }}></i>
                  What will happen:
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {warningItems.map((item, index) => (
                    <li key={index} style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderBottom: index < warningItems.length - 1 ? "1px solid #334155" : "none"
                    }}>
                      <i className="fas fa-chevron-right" style={{ color: "#3b82f6", fontSize: "0.75rem", marginTop: "0.25rem" }}></i>
                      <span style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="edit-buttons visible">
                <button
                  type="button"
                  className="edit-button cancel"
                  onClick={onBack}
                  disabled={isLoading || logoutSuccess}
                >
                  <i className="fas fa-arrow-left"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-button save"
                  disabled={isLoading || logoutSuccess}
                  style={{ 
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    borderColor: "transparent"
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Fixed variable name */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="card-header" style={{ borderBottomColor: "#ef4444" }}>
              <h3 className="card-title">
                <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444", marginRight: "0.5rem" }}></i>
                Confirm Logout
              </h3>
              <p className="card-description" style={{ color: "#ef4444" }}>
                Are you sure you want to logout?
              </p>
            </div>
            <div className="card-content">
              <div className="warning-section" style={{ 
                backgroundColor: "#1e293b", 
                border: "1px solid #ef4444", 
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1.5rem"
              }}>
                <p style={{ color: "#ffffff", textAlign: "center", fontWeight: "600", marginBottom: "0.5rem" }}>
                  You will be signed out {logoutAllDevices ? "from all devices" : "from this device"}
                </p>
                {logoutAllDevices && (
                  <p style={{ color: "#f59e0b", textAlign: "center", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    <i className="fas fa-exclamation-circle"></i> All active sessions will be terminated
                  </p>
                )}
                {clearData && (
                  <p style={{ color: "#f59e0b", textAlign: "center", fontSize: "0.875rem" }}>
                    <i className="fas fa-exclamation-circle"></i> Local data will be cleared
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="edit-button cancel"
                  onClick={cancelLogout}
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
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-out-alt"></i>
                      Yes, Logout
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