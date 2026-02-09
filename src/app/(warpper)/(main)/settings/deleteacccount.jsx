import { useState } from "react";
import "../../../css/delete-account.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const DeleteAccount = ({ onBack }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [finalConfirmation, setFinalConfirmation] = useState(false);

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
    if (deleteError) setDeleteError("");
  };

  const validateForm = () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return false;
    }
    
    return true;
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
      // Simulate account deletion process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show success
      setDeleteSuccess(true);
      
      // Reset form and go back after delay
      setTimeout(() => {
        setPassword("");
        setDeleteSuccess(false);
        if (onBack) {
          onBack();
        }
      }, 3000);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      setPasswordError("Invalid password. Please try again.");
      setDeleteError("Failed to delete account. Please check your password.");
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
      {/* Back Button */}
      <button
        onClick={onBack}
        className="back-button"
        disabled={isDeleting || deleteSuccess}
        type="button"
      >
         <ArrowBackIosIcon fontSize="small" />
      </button>

      <div className="delete-account-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Danger Zone</h1>
          <p className="profile-subtitle">Permanent account deletion</p>
        </div>

        {/* Success/Error Messages */}
        {deleteSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <span>Your account has been permanently deleted!</span>
          </div>
        )}
        
        {deleteError && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{deleteError}</span>
          </div>
        )}

        {/* First Confirmation Modal */}
        {showConfirmation && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-exclamation-triangle" style={{ color: "#f87171", marginRight: "0.5rem" }}></i>
                  Are you sure you want to proceed?
                </h3>
                <p className="card-description">
                  You're about to start the account deletion process
                </p>
              </div>
              <div className="card-content">
                <p style={{ color: "#e2e8f0", marginBottom: "1rem" }}>
                  This will initiate the account deletion process. You'll have one final confirmation step before your account is permanently deleted.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="edit-button cancel"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="edit-button save"
                    onClick={confirmFirstStep}
                    disabled={isDeleting}
                    style={{ background: "#ef4444", borderColor: "#dc2626" }}
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
                  <i className="fas fa-skull-crossbones" style={{ color: "#ef4444", marginRight: "0.5rem" }}></i>
                  Final Confirmation
                </h3>
                <p className="card-description" style={{ color: "#f87171" }}>
                  This is your last chance to keep your account
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
                    Are you absolutely sure you want to delete your account?
                  </p>
                  <p style={{ color: "#f87171", textAlign: "center", fontSize: "0.875rem" }}>
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
              <i className="fas fa-radiation-alt" style={{ color: "#ef4444", marginRight: "0.5rem" }}></i>
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
                  <i className="fas fa-times" style={{ color: "#ef4444", marginTop: "0.25rem" }}></i>
                  <span style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        

        

        {/* Delete Form Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-trash-alt" style={{ color: "#ef4444", marginRight: "0.5rem" }}></i>
              Delete Your Account
            </h3>
            <p className="card-description">
              If you're certain about deleting your account, proceed below
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleDeleteAccount}>
              {/* Password Verification */}
              <div className="form-field">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-input with-prefix"
                    placeholder="Enter your password to confirm"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={isDeleting || deleteSuccess}
                    required
                  />
                </div>
                {passwordError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    <i className="fas fa-exclamation-circle"></i>
                    {passwordError}
                  </div>
                )}
                <p className="input-hint">
                  You must enter your current password to initiate account deletion
                </p>
              </div>

              {/* Final Warning */}
              <div style={{ 
                backgroundColor: "#0f172a", 
                borderLeft: "3px solid #ef4444",
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "0 0.375rem 0.375rem 0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444" }}></i>
                  <div>
                    <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.875rem" }}>This is your final warning</div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.75rem", marginTop: "0.125rem" }}>
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
                  onClick={onBack}
                  disabled={isDeleting || deleteSuccess}
                >
                  <i className="fas fa-arrow-left"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-button save"
                  disabled={isDeleting || deleteSuccess || !password.trim()}
                  style={{ 
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    borderColor: "transparent"
                  }}
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete My Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;