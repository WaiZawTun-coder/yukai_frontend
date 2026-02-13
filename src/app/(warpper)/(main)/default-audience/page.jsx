"use client";

import { useState, useEffect } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";
import { useAuth } from "@/context/AuthContext";

const WhoCanSeePosts = () => {
    const [selectedOption, setSelectedOption] = useState("Friends");
    const [currentSetting, setCurrentSetting] = useState("Friends");
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const { user, setUser } = useAuth();
    const apiFetch = useApi();
    const router = useRouter();

    // Material UI icons mapping
    const privacyOptions = [
        {
            id: "public",
            value: "Public",
            icon: <PublicIcon />,
            description: "Anyone on or off the platform can see your posts",
        },
        {
            id: "friends",
            value: "Friends",
            icon: <GroupIcon />,
            description: "Only your confirmed friends can see your posts",
        },
        {
            id: "private",
            value: "Only me",
            icon: <LockIcon />,
            description: "Only you can see your posts - completely private",
        },
    ];

    // Load default privacy setting
    useEffect(() => {
        const initializeData = async () => {
            try {
                // First try localStorage
                const savedSetting = localStorage.getItem("postVisibility") || "Friends";
                setSelectedOption(savedSetting);
                setCurrentSetting(savedSetting);

                // Then try backend
                try {
                    const response = await apiFetch("/api/user/privacy/default");
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === true) {
                            let displayValue = "Friends";
                            if (data.default_privacy === "public") displayValue = "Public";
                            else if (data.default_privacy === "friends") displayValue = "Friends";
                            else if (data.default_privacy === "only me") displayValue = "Only me";

                            setSelectedOption(displayValue);
                            setCurrentSetting(displayValue);
                            localStorage.setItem("postVisibility", displayValue);
                        }
                    }
                } catch {
                    console.log("Backend unavailable, using localStorage");
                }
            } catch { }
            finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [apiFetch]);

    const handleOptionSelect = (option) => {
        if (isLoading || loading) return;
        setSelectedOption(option);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedOption === currentSetting) return;

        setIsLoading(true);

        try {
            let dbValue = "friends";
            if (selectedOption === "Public") dbValue = "public";
            else if (selectedOption === "Friends") dbValue = "friends";
            else if (selectedOption === "Only me") dbValue = "private";

            try {
                const response = await apiFetch("/api/user/privacy/default", {
                    method: "POST",
                    body: { privacy: dbValue },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        setCurrentSetting(selectedOption);
                        localStorage.setItem("postVisibility", selectedOption);
                    } else {
                        throw new Error(data.message || "Backend save failed");
                    }
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch {
                setCurrentSetting(selectedOption);
                localStorage.setItem("postVisibility", selectedOption);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setUser(prev => ({ ...prev, default_audience: currentSetting.toLowerCase() == "only me" ? "private" : currentSetting.toLowerCase() }))
    }, [currentSetting, setUser])

    if (loading) {
        return (
            <div className="who-can-see-posts-page">
                <div className="who-can-see-posts-container">
                    <div className="loading-container">
                        <PublicIcon className="spin" />
                        <p>Loading privacy settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="who-can-see-posts-page">
            <div className="who-can-see-posts-container">
                <div className="page-header">
                    <button onClick={router.back} className="back-button" disabled={isLoading}>
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className="page-name">Default Post Privacy</span>
                </div>

                <div className="privacy-form-container">
                    <form onSubmit={handleSubmit} className="privacy-form">
                        <div className="form-section options-section">
                            <h3 className="section-title">Select Default Privacy Level</h3>
                            <p className="section-subtitle">
                                Choose who can see your posts by default. You can still change privacy for individual posts.
                            </p>

                            <div className="privacy-options">
                                {privacyOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`privacy-option ${selectedOption === option.value ? "selected" : ""} ${isLoading ? "disabled" : ""
                                            }`}
                                        onClick={() => handleOptionSelect(option.value)}
                                    >
                                        <div className="privacy-option-radio">
                                            <div className={`radio-circle ${selectedOption === option.value ? "checked" : ""}`}>
                                                {selectedOption === option.value && <div className="radio-dot" />}
                                            </div>
                                        </div>

                                        <div className="privacy-option-avatar">{option.icon}</div>

                                        <div className="privacy-option-details">
                                            <div className="privacy-option-header">
                                                <h4 className="privacy-option-name">{option.value}</h4>
                                            </div>
                                            <p className="privacy-option-description">{option.description}</p>
                                        </div>
                                        {currentSetting === option.value && (
                                            <div className="active-badge">
                                                <CheckCircleIcon fontSize="small" /> Active
                                            </div>
                                        )}

                                        <div className="privacy-option-action">
                                            <ChevronRightIcon />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={router.back} className="action-button cancel-button" disabled={isLoading}>
                                Cancel
                            </button>

                            <button type="submit" className="action-button switch-button" disabled={isLoading || selectedOption === currentSetting}>
                                {isLoading ? "Saving..." : "Set as Default"}
                            </button>
                        </div>

                        <div className="info-note">
                            <span>
                                This setting only affects <strong>new posts</strong> you create. Existing posts keep their original privacy
                                settings. You can still choose a different privacy for individual posts when creating them.
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WhoCanSeePosts;