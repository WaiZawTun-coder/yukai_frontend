"use client";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { getBackendUrl } from "@/utilities/url";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { setAccessToken, setUser, getDeviceId } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      setOtpError("OTP is required");
      return;
    }

    if (!otp.trim()) {
      setOtpError("OTP is required");
      showSnackbar({
        title: "OTP required",
        message: "Please enter the OTP",
        variant: "warning",
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
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ otp, device_id: getDeviceId() }),
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
        setOtpError(data.message || "OTP verification failed");
        showSnackbar({
          title: "Verification Failed",
          message: data.message,
          variant: "error",
        });
      }
    } catch (err) {
      showSnackbar({
        title: "Error",
        message: err.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-page-wrapper">
      <div className="verify-otp-page-card">
        <h2 className="verify-otp-page-title">Verify OTP</h2>

        <form onSubmit={handleVerify}>
          <div className="verify-otp-page-input">
            <TextField
              label="Enter OTP"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              helperText={otpError}
              error={!!otpError}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
