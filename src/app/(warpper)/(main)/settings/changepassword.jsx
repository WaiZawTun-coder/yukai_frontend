'use client';

import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const ChangePassword = ({ onBack }) => {
  const { user: authUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const apiFetch = useApi();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otpCode: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
    otpCode: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Enter a new password',
    color: 'gray'
  });

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Check password strength when typing new password
    if (field === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        message: 'Enter a new password',
        color: 'gray'
      });
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    let message = '';
    let color = '';
    
    if (score <= 2) {
      message = 'Weak password';
      color = 'red';
    } else if (score <= 4) {
      message = 'Fair password';
      color = 'orange';
    } else {
      message = 'Strong password';
      color = 'green';
    }

    setPasswordStrength({
      score,
      message,
      color
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!passwordData.otpCode) {
      newErrors.otpCode = 'OTP code is required';
    } else if (passwordData.otpCode.length < 8) {
      newErrors.otpCode = 'OTP must be 8 digits';
    }
    
    return newErrors;
  };

  const handleSendOTP = async () => {
    try {
      setIsSendingOtp(true);
      
      // First, check if user exists and get their email
      const userRes = await apiFetch(`/api/get-user?user_id=${authUser?.user_id}`);
      
      if (!userRes.status) {
        throw new Error("User not found");
      }
      
      // Generate OTP
      const otpRes = await apiFetch("/api/generate-otp-api", {
        method: "POST",
        body: {
          user_id: authUser?.user_id
        },
      });

      if (otpRes.status) {
        showSnackbar({
          title: "OTP Sent",
          message: `OTP has been sent to ${userRes.data.email || 'your registered email/phone'}`,
          variant: "success",
        });
      } else {
        throw new Error(otpRes.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showSnackbar({
        title: "OTP Failed",
        message: error.message || "Failed to send OTP",
        variant: "error",
      });
    } finally {
      setIsSendingOtp(false);
    }
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
      const res = await apiFetch("/api/change-password", {
        method: "POST",
        body: {
          user_id: authUser?.user_id,
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          otpcode: passwordData.otpCode
        },
      });

      if (res.status) {
        showSnackbar({
          title: "Success!",
          message: "Password changed successfully",
          variant: "success",
          duration: 3000,
        });

        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          otpCode: ''
        });
        setErrors({});
        setPasswordStrength({
          score: 0,
          message: 'Enter a new password',
          color: 'gray'
        });
        
        // Optionally go back after success
        if (onBack) {
          setTimeout(() => onBack(), 1500);
        }
        
      } else {
        throw new Error(res.message || "Failed to change password");
      }
      
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Handle specific errors
      let errorMessage = error.message;
      if (errorMessage.includes("Current password is incorrect")) {
        setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
      } else if (errorMessage.includes("OTP verification failed") || 
                 errorMessage.includes("Invalid OTP code") ||
                 errorMessage.includes("No valid OTP found")) {
        setErrors(prev => ({ ...prev, otpCode: errorMessage }));
      } else {
        showSnackbar({
          title: "Error",
          message: errorMessage || "Failed to change password. Please try again.",
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-wrapper">
        {/* Header with Back Button */}
        <button
          onClick={onBack}
          className="back-button"
          disabled={isLoading || isSendingOtp}
        >
           <ArrowBackIosIcon fontSize="small" />
        </button>

        <div className="profile-header">
          <h1 className="profile-title">Change Password</h1>
          <p className="profile-subtitle">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Main Form Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Change Your Password</h2>
            <p className="card-description">
              Enter all details below to change your password
            </p>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit} className="password-form">
              {/* Current Password Field */}
              <div className="form-field">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password <span className="required">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className={`form-input ${errors.currentPassword ? 'error-input' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    tabIndex="-1"
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPasswords.currentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="form-field">
                <label htmlFor="newPassword" className="form-label">
                  New Password <span className="required">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                    className={`form-input ${errors.newPassword ? 'error-input' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    tabIndex="-1"
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPasswords.newPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className={`strength-progress strength-${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      ></div>
                    </div>
                    <div className="strength-info">
                      <span className={`strength-text strength-${passwordStrength.color}`}>
                        <i className={`fas ${passwordStrength.color === 'green' ? 'fa-check-circle' : passwordStrength.color === 'orange' ? 'fa-exclamation-triangle' : 'fa-times-circle'}`}></i>
                        {passwordStrength.message}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.newPassword}
                  </p>
                )}
                
                <p className="input-hint">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="form-field">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password <span className="required">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter your new password"
                    className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    tabIndex="-1"
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* OTP Field */}
              <div className="form-field">
                <div className="otp-header">
                  <label htmlFor="otpCode" className="form-label">
                    OTP Verification <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSendingOtp || isLoading}
                    className="send-otp-btn"
                  >
                    {isSendingOtp ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
                
                <div className="password-input-container">
                  <input
                    type={showPasswords.otpCode ? "text" : "password"}
                    id="otpCode"
                    value={passwordData.otpCode}
                    onChange={(e) => handleInputChange('otpCode', e.target.value)}
                    placeholder="Enter 8-digit OTP"
                    className={`form-input ${errors.otpCode ? 'error-input' : ''}`}
                    disabled={isLoading}
                    maxLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('otpCode')}
                    tabIndex="-1"
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPasswords.otpCode ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.otpCode && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.otpCode}
                  </p>
                )}
                <p className="input-hint">
                  Click "Send OTP" to receive OTP on your registered email/phone
                </p>
              </div>

              {/* Form Actions */}
              <div className="form-edit">
                <button
                  type="button"
                  onClick={onBack}
                  className="edit-button cancel"
                  disabled={isLoading || isSendingOtp}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="edit-button save"
                  disabled={
                    isLoading || 
                    isSendingOtp || 
                    !passwordData.currentPassword || 
                    !passwordData.newPassword || 
                    !passwordData.confirmPassword || 
                    !passwordData.otpCode
                  }
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ChangePassword;    