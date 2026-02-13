"use client";

import { useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GppBadIcon from "@mui/icons-material/GppBad";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";

const AccountHealthPage = () => {
    const router = useRouter();
    const apiFetch = useApi();

    const [status, setStatus] = useState("healthy");
    const [loading, setLoading] = useState(true);

    const statusConfig = {
        healthy: {
            label: "Healthy",
            icon: <CheckCircleIcon />,
            description:
                "Your account is in good standing. You have full access to all features.",
            className: "status-healthy"
        },
        warn_user: {
            label: "Warning",
            icon: <WarningAmberIcon />,
            description:
                "Your account has received warnings. Please review community guidelines to avoid restrictions.",
            className: "status-warning"
        },
        suspense_user: {
            label: "Suspended",
            icon: <PauseCircleIcon />,
            description:
                "Your account is temporarily suspended. Some features may be unavailable.",
            className: "status-suspended"
        },
        ban_user: {
            label: "Banned",
            icon: <GppBadIcon />,
            description:
                "Your account has been permanently restricted due to policy violations.",
            className: "status-banned"
        }
    };

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const data = await apiFetch("/api/user/account-health");

                if (data.status === true && data.account_health) {
                    setStatus(data.account_health);
                }
            } catch (error) {
                console.error("Failed to load account health:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStatus();
    }, [apiFetch]);

    if (loading) {
        return (
            <div className="who-can-see-posts-page">
                <div className="who-can-see-posts-container">
                    <div className="loading-container">
                        <p>Checking account health...</p>
                    </div>
                </div>
            </div>
        );
    }

    const current = statusConfig[status] || statusConfig.healthy;

    return (
        <div className="who-can-see-posts-page">
            <div className="who-can-see-posts-container">

                {/* Header */}
                <div className="page-header">
                    <button onClick={router.back} className="back-button">
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className="page-name">Account Health</span>
                </div>

                {/* Main Card */}
                <div className="privacy-form-container">
                    <div className="privacy-form">

                        <div className="form-section options-section">
                            <h3 className="section-title">Account Status</h3>
                            <p className="section-subtitle">
                                This shows the current health and standing of your account.
                            </p>

                            <div className={`account-health-card ${current.className}`}>
                                <div className="health-icon">
                                    {current.icon}
                                </div>

                                <div className="health-details">
                                    <h4 className="health-title">
                                        {current.label}
                                    </h4>
                                    <p className="health-description">
                                        {current.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="info-note">
                            <span>
                                If you believe this status is incorrect, please contact support.
                            </span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountHealthPage;