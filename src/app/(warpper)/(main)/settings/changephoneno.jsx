"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import "../../../css/change-email.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const ChangePhoneNumber = ({ onBack }) => {
  const { user: authUser, updateUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const apiFetch = useApi();
  
  const [phoneData, setPhoneData] = useState({
    currentPhone: authUser?.phone_number || "",
    newPhone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    // Only allow numbers for phone field
    if (field === "newPhone") {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, "");
      // Limit to 11 digits
      const limitedValue = numericValue.slice(0, 11);
      setPhoneData((prev) => ({
        ...prev,
        [field]: limitedValue,
      }));
    } else {
      setPhoneData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate phone number format
    if (!phoneData.newPhone) {
      newErrors.newPhone = "New phone number is required";
    } else if (!/^\d{11}$/.test(phoneData.newPhone)) {
      newErrors.newPhone = "Phone number must be exactly 11 digits";
    }

    // Check if new phone is same as current
    if (phoneData.newPhone === phoneData.currentPhone) {
      newErrors.newPhone = "New phone number must be different from current";
    }

    if (!phoneData.password) {
      newErrors.password = "Password is required";
    } else if (phoneData.password.length < 6) {
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
      // Send request with phone_number parameter (not phone)
      const res = await apiFetch("/api/edit-user", {
        method: "POST",
        body: {
          user_id: authUser?.user_id,
          phone_number: phoneData.newPhone, // Changed from 'phone' to 'phone_number'
        },
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to update phone number");
      }

      // Show success message
      showSnackbar({
        title: "Success!",
        message: "Phone number updated successfully",
        variant: "success",
        duration: 3000,
      });

      // Update local user state
      if (updateUser) {
        updateUser({ phone_number: phoneData.newPhone });
      }

      // Update current phone display and reset form
      setPhoneData({
        currentPhone: phoneData.newPhone,
        newPhone: "",
        password: "",
      });
      setErrors({});

      // Optionally go back to settings
      if (onBack) {
        setTimeout(() => onBack(), 1500);
      }

    } catch (error) {
      console.error("Error changing phone number:", error);
      
      showSnackbar({
        title: "Error",
        message: error.message || "Failed to update phone number. Please try again.",
        variant: "error",
      });
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
              <ArrowBackIosIcon fontSize="small" />
            </button>
          )}

          <div className="header-content">
            <h1 className="page-title">Change Phone Number</h1>
            <p className="page-subtitle">
              Update your phone number in your profile.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="email-form-container">
          <form onSubmit={handleSubmit} className="email-form">
            {/* Current Phone Section */}
            <div className="form-section current-email-section">
              <h3 className="section-title">
                Current Phone Number
              </h3>
              <div className="current-email-display">
                <div className="email-info">
                  <div className="email-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="email-details">
                    <p className="email-label">Your current phone number</p>
                    <p className="email-value">{phoneData.currentPhone || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Phone Section */}
            <div className="form-section new-email-section">
              <h3 className="section-title">
                New Phone Number
              </h3>

              <div className="form-group">
                <label htmlFor="newPhone" className="form-label">
                  New Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="newPhone"
                  value={phoneData.newPhone}
                  onChange={(e) =>
                    handleInputChange("newPhone", e.target.value)
                  }
                  placeholder="Enter your new phone number"
                  className={`form-input ${errors.newPhone ? "error" : ""}`}
                  disabled={isLoading}
                />
                {errors.newPhone && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.newPhone}
                  </p>
                )}
                <p className="form-hint">
                  Enter your new phone number
                </p>
              </div>
            </div>

            {/* Security Verification */}
            <div className="form-section security-section">
              <h3 className="section-title">
                Security Verification
              </h3>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Current Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={phoneData.password}
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

            {/* Form Actions */}
            <div className="form-edit">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="edit-button cancel-button"
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="edit-button submit-button"
                disabled={
                  isLoading ||
                  !phoneData.newPhone ||
                  !phoneData.password
                }
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Update Phone Number
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

export default ChangePhoneNumber;