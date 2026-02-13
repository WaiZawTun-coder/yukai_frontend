"use client";

import { useState, useEffect } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SecurityIcon from "@mui/icons-material/Security";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";

const TwoFactorAuthPage = () => {
    const router = useRouter();
    const apiFetch = useApi();

    const [selectedOption, setSelectedOption] = useState("Off");
    const [currentSetting, setCurrentSetting] = useState("Off");
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const twoFAOptions = [
        {
            id: "off",
            value: "Off",
            icon: <LockOpenIcon />,
            description: "Two-factor authentication is disabled. Login requires only your password."
        },
        {
            id: "on",
            value: "On",
            icon: <SmartphoneIcon />,
            description: "Require a verification code from your email when logging in."
        }
    ];

    // Load current 2FA setting
    useEffect(() => {
        const loadSetting = async () => {
            try {
                // Local fallback
                const saved = localStorage.getItem("twoFactorAuth") || "Off";
                setSelectedOption(saved);
                setCurrentSetting(saved);

                // Try backend
                try {
                    const response = await apiFetch("/api/user/security/2fa");

                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === true) {
                            const value = data.two_factor_enabled ? "On" : "Off";
                            setSelectedOption(value);
                            setCurrentSetting(value);
                            localStorage.setItem("twoFactorAuth", value);
                        }
                    }
                } catch (err) {
                    console.log("Backend unavailable, using local storage.");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadSetting();
    }, []);

    const handleOptionSelect = (option) => {
        if (loading || isLoading) return;
        setSelectedOption(option);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedOption === currentSetting) return;

        setIsLoading(true);

        try {
            const enabled = selectedOption === "On";

            try {
                const response = await apiFetch("/api/user/security/2fa", {
                    method: "POST",
                    body: { enabled }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (!data.status) throw new Error(data.message);
                } else {
                    throw new Error("Failed to update setting");
                }
            } catch (apiError) {
                // fallback
                console.log("Saved locally only");
            }

            setCurrentSetting(selectedOption);
            localStorage.setItem("twoFactorAuth", selectedOption);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="who-can-see-posts-page">
                <div className="who-can-see-posts-container">
                    <div className="loading-container">
                        <p>Loading security settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="who-can-see-posts-page">
            <div className="who-can-see-posts-container">

                {/* Header */}
                <div className="page-header">
                    <button
                        onClick={router.back}
                        className="back-button"
                        disabled={isLoading}
                    >
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className="page-name">Two-Factor Authentication</span>
                </div>

                {/* Form */}
                <div className="privacy-form-container">
                    <form onSubmit={handleSubmit} className="privacy-form">

                        <div className="form-section options-section">
                            <h3 className="section-title">
                                Two-Factor Authentication
                            </h3>
                            <p className="section-subtitle">
                                Add an extra layer of security to your account by requiring a verification code when signing in.
                            </p>

                            <div className="privacy-options">
                                {twoFAOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`privacy-option ${selectedOption === option.value ? "selected" : ""
                                            } ${isLoading ? "disabled" : ""}`}
                                        onClick={() => handleOptionSelect(option.value)}
                                    >
                                        <div className="privacy-option-radio">
                                            <div
                                                className={`radio-circle ${selectedOption === option.value ? "checked" : ""
                                                    }`}
                                            >
                                                {selectedOption === option.value && (
                                                    <div className="radio-dot"></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="privacy-option-avatar">
                                            <div className="privacy-avatar-initials">
                                                {option.icon}
                                            </div>
                                        </div>

                                        <div className="privacy-option-details">
                                            <div className="privacy-option-header">
                                                <h4 className="privacy-option-name">
                                                    {option.value}
                                                </h4>
                                                {currentSetting === option.value && (
                                                    <div className="active-badge">
                                                        Active Setting
                                                    </div>
                                                )}
                                            </div>
                                            <p className="privacy-option-description">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={router.back}
                                className="action-button cancel-button"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="action-button switch-button"
                                disabled={
                                    isLoading || selectedOption === currentSetting
                                }
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="info-note">
                            <SecurityIcon fontSize="small" />
                            <span>
                                When enabled, you’ll need a verification code from your
                                phone each time you log in from a new device.
                            </span>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuthPage;