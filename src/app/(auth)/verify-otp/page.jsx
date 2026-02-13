"use client";

import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { getBackendUrl } from "@/utilities/url";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const { setAccessToken, setUser, getDeviceId } = useAuth();

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!otp) return;

        if (!otp.trim()) {
            showSnackbar({
                title: "OTP required",
                message: "Please enter the OTP",
                variant: "warning"
            });
            return;
        }

        try {
            setLoading(true);

            const tempToken = localStorage.getItem("temp_access_token");

            const response = await fetch(getBackendUrl() + "/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tempToken}`
                },
                body: JSON.stringify({ otp, device_id: getDeviceId() })
            });

            const data = await response.json();

            if (data.status) {
                localStorage.removeItem("temp_access_token");

                // store final token
                // localStorage.setItem("access_token", data.data.access_token);
                setAccessToken(data.data.access_token);
                setUser(data.data);

                router.replace("/");
            } else {
                showSnackbar({
                    title: "Verification Failed",
                    message: data.message,
                    variant: "error"
                });
            }
        } catch (err) {
            showSnackbar({
                title: "Error",
                message: err.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-wrapper">
            <h2>Verify OTP</h2>

            <form onSubmit={handleVerify}>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>
            </form>
        </div>
    );
};

export default VerifyOTP;