"use client";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const ForgetPassword = () => {
  const apiFetch = useApi();
  const router = useRouter();

  const { showSnackbar } = useSnackbar();

  // step: 1 = email, 2 = otp + new password
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const getFieldChangeHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return (e) => handleFieldChange(name, e.target.value);
    },
    [handleFieldChange]
  );

  // ---------------- STEP 1: SEND OTP ----------------
  const handleGetOTP = async () => {
    const email = formData.email.trim();
    let hasError = false;

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: { status: true, message: "Email cannot be empty" },
      }));
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      const res = await apiFetch("/auth/forget-password", {
        method: "POST",
        body: { email },
      });

      showSnackbar({
        title: "Send OTP",
        message: res.message,
        variant: res.status ? "success" : "error",
      });

      if (res.status) {
        setStep(2); // move to step 2
      }
    } catch (err) {
      showSnackbar({
        title: "Failed to get OTP",
        message: err.message ?? "",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- STEP 2: RESET PASSWORD ----------------
  const handleResetPassword = async () => {
    const { otp, password, confirmPassword, email } = formData;
    let hasError = false;
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = { status: true, message: "OTP is required" };
      hasError = true;
    }

    if (!password) {
      newErrors.password = { status: true, message: "Password is required" };
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = {
        status: true,
        message: "Passwords do not match",
      };
      hasError = true;
    }

    if (hasError) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: {
          email,
          otp,
          password,
        },
      });

      showSnackbar({
        title: "Reset Password",
        message: res.message,
        variant: res.status ? "success" : "error",
      });

      if (res.status) {
        router.push("/login");
      }
    } catch (err) {
      showSnackbar({
        title: "Reset failed",
        message: err.message ?? "",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="header">
          <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
        </div>

        <div className="content">
          <div className="outer-box">
            <div className="inner-box">
              <form className="forget-form">
                {/* -------- STEP 1 -------- */}
                {step === 1 && (
                  <>
                    <TextField
                      label="Enter Email"
                      name="email"
                      type="email"
                      onChange={getFieldChangeHandler("email")}
                      required
                      error={errors.email?.status ?? false}
                      color="accent"
                      helperText={errors.email?.message ?? ""}
                    />

                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleGetOTP();
                      }}
                      disabled={loading}
                    >
                      {loading ? "Sending" : "Send"} OTP
                    </Button>
                  </>
                )}

                {/* -------- STEP 2 -------- */}
                {step === 2 && (
                  <>
                    <TextField
                      label="OTP Code"
                      name="otp"
                      type="text"
                      onChange={getFieldChangeHandler("otp")}
                      required
                      error={errors.otp?.status ?? false}
                      color="accent"
                      helperText={errors.otp?.message ?? ""}
                    />

                    <TextField
                      label="New Password"
                      name="password"
                      type="password"
                      onChange={getFieldChangeHandler("password")}
                      required
                      error={errors.password?.status ?? false}
                      color="accent"
                      helperText={errors.password?.message ?? ""}
                    />

                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      onChange={getFieldChangeHandler("confirmPassword")}
                      required
                      error={errors.confirmPassword?.status ?? false}
                      color="accent"
                      helperText={errors.confirmPassword?.message ?? ""}
                    />

                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleResetPassword();
                      }}
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <Button
                      variant="text"
                      onClick={(e) => {
                        e.preventDefault();
                        setStep(1);
                      }}
                    >
                      Back
                    </Button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="back-link-container">
          <Link href="/login" className="back-text-link">
            {"<<"} Back to Login
          </Link>
        </div>

        <div className="footer-logo">
          <span>yukai</span>
          <h3>愉快</h3>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
