'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from 'next/navigation';

const ChangePassword = ({ onBack }) => {
    const { user: authUser } = useAuth();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
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
    const [method, setMethod] = useState("password");

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

        if (method === "password") {
            if (!passwordData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
        }

        if (method === "otp") {
            if (!passwordData.otpCode) {
                newErrors.otpCode = 'OTP code is required';
            } else if (passwordData.otpCode.length < 6) {
                newErrors.otpCode = 'OTP must be at least 6 digits';
            }
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
            const otpRes = await apiFetch("/api/request-password-otp", {
                method: "POST",
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
            const body = {
                user_id: authUser?.user_id,
                new_password: passwordData.newPassword
            };

            if (method === "password") {
                body.current_password = passwordData.currentPassword;
            } else {
                body.otpcode = passwordData.otpCode;
            }

            const res = await apiFetch("/api/change-password", {
                method: "POST",
                body
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

    useEffect(() => {
        if (method === "otp") {
            setPasswordData(prev => ({ ...prev, currentPassword: "" }));
        } else {
            setPasswordData(prev => ({ ...prev, otpCode: "" }));
        }
    }, [method]);

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-wrapper">
                <div className='page-header'>
                    <button
                        onClick={router.back}
                        className="back-button"
                        disabled={isLoading || isSendingOtp}
                    >
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className='page-name'>Change Password</span>
                </div>

                {/* Main Form Card */}
                <div className="change-password-card">
                    <div className="card-header">
                        <h2 className="card-title">Change Your Password</h2>
                        <p className="card-description">
                            Enter all details below to change your password
                        </p>
                    </div>

                    <div className="card-content">
                        <form onSubmit={handleSubmit} className="password-form">
                            {/* Current Password Field */}
                            {method == "password" ?
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

                                            {showPasswords.currentPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="error-message">
                                            <ErrorOutlineIcon fontSize="small" /> {errors.currentPassword}
                                        </p>
                                    )}
                                    <span className='change-option' onClick={() => {
                                        setMethod("otp");
                                        setErrors({});
                                    }}>Forget password?</span>
                                </div>
                                :
                                <div className="form-field">
                                    <div className="otp-header">
                                        <label htmlFor="otpCode" className="form-label">
                                            OTP Verification <span className="required">*</span>
                                        </label>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px" }}>
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
                                                {showPasswords.otpCode ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={isSendingOtp || isLoading}
                                            className="send-otp-btn"
                                        >
                                            {isSendingOtp ? (
                                                <>
                                                    <CircularProgress size={16} />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <SendOutlinedIcon />
                                                    Send OTP
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {errors.otpCode && (
                                        <p className="error-message">
                                            <ErrorOutlineIcon fontSize="small" /> {errors.otpCode}
                                        </p>
                                    )}
                                    <p className="input-hint">
                                        Click &quot;Send OTP&quot; to receive OTP on your registered email/phone
                                    </p>
                                    <span className='change-option' onClick={() => {
                                        setMethod("password");
                                        setErrors({});
                                    }}>Use old password?</span>
                                </div>}

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

                                        {showPasswords.newPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
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
                                            {passwordStrength.color === "green" && <CheckCircleOutlineIcon fontSize="small" />}
                                            {passwordStrength.color === "orange" && <WarningAmberOutlinedIcon fontSize="small" />}
                                            {passwordStrength.color === "red" && <ErrorOutlineIcon fontSize="small" />}

                                        </div>
                                    </div>
                                )}

                                {errors.newPassword && (
                                    <p className="error-message">
                                        <ErrorOutlineIcon fontSize="small" /> {errors.newPassword}
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

                                        {showPasswords.confirmPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="error-message">
                                        <ErrorOutlineIcon fontSize="small" /> {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="form-edit">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="edit-button cancel"
                                    disabled={isLoading || isSendingOtp}
                                ><CloseOutlinedIcon fontSize="small" />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="edit-button save"
                                    disabled={
                                        isLoading ||
                                        isSendingOtp ||
                                        !passwordData.newPassword ||
                                        !passwordData.confirmPassword ||
                                        (method === "password" && !passwordData.currentPassword) ||
                                        (method === "otp" && !passwordData.otpCode)
                                    }
                                >
                                    {isLoading ? (
                                        <><CircularProgress size={16} />
                                            Changing Password...
                                        </>
                                    ) : (
                                        <><KeyOutlinedIcon fontSize="small" />
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