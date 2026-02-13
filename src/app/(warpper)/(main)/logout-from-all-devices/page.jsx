"use client";

import Button from "@/components/ui/Button";
import Popup from "@/components/ui/Popup";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import PublicIcon from "@mui/icons-material/Public";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LogoutAllDevicesPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const router = useRouter();
    const apiFetch = useApi();
    const { showSnackbar } = useSnackbar();
    const { getDeviceId } = useAuth();

    // Load login activity
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await apiFetch("/api/user/get-devices");
                if (res.status) setSessions(res.data);
            } catch (err) {
                console.log(err);
                showSnackbar({ title: "Error", message: "Failed to load sessions", variant: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [apiFetch, showSnackbar]);

    // Logout all devices
    const handleLogoutAll = async () => {
        try {
            setLoggingOut(true);
            const res = await apiFetch("/api/user/logout-all", { method: "POST", body: { device_id: getDeviceId() } });

            if (res.status) {
                showSnackbar({ title: "Success", message: "Logged out from all devices", variant: "success" });
                setSessions(sessions.map(s => ({ ...s, is_current: s.is_current ? true : false }))); // current session stays
                setModalOpen(false);
            } else {
                showSnackbar({ title: "Error", message: res.message ?? "Logout failed", variant: "error" });
            }
        } catch (err) {
            showSnackbar({ title: "Error", message: err.message, variant: "error" });
        } finally {
            setLoggingOut(false);
        }
    };

    const getDeviceIcon = (deviceName) => {
        if (!deviceName) return <PublicIcon />;
        if (/iphone|ipad|ios/i.test(deviceName)) return <i className="fab fa-apple"></i>;
        if (/android/i.test(deviceName)) return <i className="fab fa-android"></i>;
        if (/windows/i.test(deviceName)) return <i className="fab fa-windows"></i>;
        return <PublicIcon />;
    };

    if (loading) return <div className="loading">Loading...</div>;

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
                            <h3 className="section-title">Logged in devices</h3>
                            <p className="section-subtitle">Review devices that have accessed your account.</p>

                            <div className="login-activity-list">
                                {sessions.length === 0 && <div className="empty-state">No login activity found.</div>}

                                {sessions.map((session) => (
                                    <div key={session.id} className="login-activity-item">
                                        <div className="activity-device">{getDeviceIcon(session.device)}</div>
                                        <div className="activity-details">
                                            <div className="activity-header">
                                                <span className="device-name">{session.device || "Unknown Device"}</span>
                                                {session.is_current && <span className="current-badge">Current Session</span>}
                                            </div>
                                            <div className="activity-meta">
                                                <span><PublicIcon fontSize="inherit" /> {session.location || "Unknown location"}</span>
                                                <span>IP: {session.ip || "N/A"}</span>
                                                <span><AccessTimeIcon fontSize="inherit" /> {session.login_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="form-actions" style={{ marginTop: "20px" }}>
                                <Button onClick={() => setModalOpen(true)} color="danger">
                                    Log out from all devices
                                </Button>
                            </div>

                        </div>

                        <div className="info-note">
                            If you notice unfamiliar activity, change your password immediately.
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {modalOpen && (
                    <Popup isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Logout" footer={
                        <div className="popup-actions">
                            <button className="popup-btn popup-btn-cancel" onClick={() => { setModalOpen(false) }}>Cancel</button>
                            <button className="popup-btn popup-btn-danger" onClick={handleLogoutAll} disabled={loggingOut}>{loggingOut ? "Logging out..." : "Log out all devices"}</button>
                        </div>
                    }>
                        <p>Are you sure you want to log out from all devices except your current session?</p>
                    </Popup>
                )}

            </div>
        </div>
    );
};

export default LogoutAllDevicesPage;