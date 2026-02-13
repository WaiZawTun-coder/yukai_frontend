"use client";

import { useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PublicIcon from "@mui/icons-material/Public";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRouter } from "next/navigation";
import { useApi } from "@/utilities/api";

const LoginActivityPage = () => {
    const router = useRouter();
    const apiFetch = useApi();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const data = await apiFetch("/api/user/login-activity");

                if (data.status) {
                    setSessions(data.sessions || []);
                }

            } catch (error) {
                console.error("Failed to load login activity:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, [apiFetch]);

    const getDeviceIcon = (device) => {
        if (!device) return <LaptopMacIcon fontSize="small" />;
        return device.toLowerCase().includes("mobile")
            ? <PhoneIphoneIcon fontSize="small" />
            : <LaptopMacIcon fontSize="small" />;
    };

    if (loading) {
        return (
            <div className="who-can-see-posts-page">
                <div className="who-can-see-posts-container">
                    <div className="loading-container">
                        <p>Loading login activity...</p>
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
                    <button onClick={router.back} className="back-button">
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <span className="page-name">Login Activity</span>
                </div>

                {/* Content */}
                <div className="privacy-form-container">
                    <div className="privacy-form">

                        <div className="form-section options-section">
                            <h3 className="section-title">Recent Logins</h3>
                            <p className="section-subtitle">
                                Review devices that have accessed your account.
                            </p>

                            <div className="login-activity-list">
                                {sessions.length === 0 && (
                                    <div className="empty-state">
                                        No login activity found.
                                    </div>
                                )}

                                {sessions.map((session, index) => (
                                    <div key={index} className="login-activity-item">

                                        <div className="activity-device">
                                            {getDeviceIcon(session.device)}
                                        </div>

                                        <div className="activity-details">
                                            <div className="activity-header">
                                                <span className="device-name">
                                                    {session.device || "Unknown Device"}
                                                </span>

                                                {session.is_current && (
                                                    <span className="current-badge">
                                                        Current Session
                                                    </span>
                                                )}
                                            </div>

                                            <div className="activity-meta">
                                                <span>
                                                    <PublicIcon fontSize="inherit" /> {session.location || "Unknown location"}
                                                </span>

                                                <span>
                                                    IP: {session.ip || "N/A"}
                                                </span>

                                                <span>
                                                    <AccessTimeIcon fontSize="inherit" /> {session.login_time}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="info-note">
                            If you notice unfamiliar activity, change your password immediately.
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginActivityPage;