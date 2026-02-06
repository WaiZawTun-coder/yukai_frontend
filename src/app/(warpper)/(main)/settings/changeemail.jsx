"use client";

import { useState } from "react";
import "../../../css/change-email.css";

const ChangeEmail = ({ onBack }) => {
  const [emailData, setEmailData] = useState({
    currentEmail: "john.doe@example.com",
    newEmail: "",
    confirmEmail: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!emailData.newEmail) {
      newErrors.newEmail = "New email is required";
    } else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      newErrors.newEmail = "Please enter a valid email address";
    }

    if (!emailData.confirmEmail) {
      newErrors.confirmEmail = "Please confirm your new email";
    } else if (emailData.newEmail !== emailData.confirmEmail) {
      newErrors.confirmEmail = "Emails do not match";
    }

    if (!emailData.password) {
      newErrors.password = "Password is required";
    } else if (emailData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        "✅ Email change request submitted! Please check your current email for verification."
      );

      // Reset form
      setEmailData({
        currentEmail: emailData.newEmail, // Update current email to new one
        newEmail: "",
        confirmEmail: "",
        password: "",
      });
      setErrors({});

      // Optionally go back to settings
      if (onBack) {
        setTimeout(() => onBack(), 1500);
      }
    } catch (error) {
      console.error("Error changing email:", error);
      alert("❌ Failed to change email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-email-page">
      <div className="change-email-container">
        {/* Header with Back Button */}
        <div className="change-email-header">
          {onBack && (
            <button
              onClick={onBack}
              className="back-button"
              disabled={isLoading}
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Settings</span>
            </button>
          )}

          <div className="header-content">
            <h1 className="page-title">Change Email Address</h1>
            <p className="page-subtitle">
              Update your email address. You'll receive verification links on
              both emails.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="email-form-container">
          <form onSubmit={handleSubmit} className="email-form">
            {/* Current Email Section */}
            <div className="form-section current-email-section">
              <h3 className="section-title">
                <i className="fas fa-envelope section-icon"></i>
                Current Email Address
              </h3>
              <div className="current-email-display">
                <div className="email-info">
                  <div className="email-icon">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="email-details">
                    <p className="email-label">Your current email</p>
                    <p className="email-value">{emailData.currentEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Email Section */}
            <div className="form-section new-email-section">
              <h3 className="section-title">
                <i className="fas fa-envelope-open-text section-icon"></i>
                New Email Address
              </h3>

              <div className="form-group">
                <label htmlFor="newEmail" className="form-label">
                  New Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailData.newEmail}
                  onChange={(e) =>
                    handleInputChange("newEmail", e.target.value)
                  }
                  placeholder="Enter your new email address"
                  className={`form-input ${errors.newEmail ? "error" : ""}`}
                  disabled={isLoading}
                />
                {errors.newEmail && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.newEmail}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmEmail" className="form-label">
                  Confirm New Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="confirmEmail"
                  value={emailData.confirmEmail}
                  onChange={(e) =>
                    handleInputChange("confirmEmail", e.target.value)
                  }
                  placeholder="Re-enter your new email address"
                  className={`form-input ${errors.confirmEmail ? "error" : ""}`}
                  disabled={isLoading}
                />
                {errors.confirmEmail && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.confirmEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Security Verification */}
            <div className="form-section security-section">
              <h3 className="section-title">
                <i className="fas fa-shield-alt section-icon"></i>
                Security Verification
              </h3>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Current Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={emailData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your current password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.password}
                  </p>
                )}
                <p className="form-hint">
                  Enter your password to verify your identity
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <div className="notice-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="notice-content">
                <h4 className="notice-title">Important Security Information</h4>
                <ul className="notice-list">
                  <li>
                    A verification link will be sent to your current email
                  </li>
                  <li>
                    Another verification link will be sent to your new email
                  </li>
                  <li>Your email will be updated after both verifications</li>
                  <li>You may need to sign in again after the change</li>
                </ul>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="action-button cancel-button"
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="action-button submit-button"
                disabled={
                  isLoading ||
                  !emailData.newEmail ||
                  !emailData.confirmEmail ||
                  !emailData.password
                }
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Change Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
