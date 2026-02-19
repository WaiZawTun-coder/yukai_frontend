"use client";

import AppStepper from "@/components/ui/AppStepper";
import RadioButtons from "@/components/ui/RadioButton";
import TextField from "@/components/ui/TextField";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

const Register = () => {
  const apiFetch = useApi();
  const { accessToken, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------------- STATES ---------------- */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState(null);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const [imagePreview, setImagePreview] = useState(null);
  const [defaultPreviewImage, setDefaultPreviewImage] = useState("male");
  const [generatedUsername, setGeneratedUsername] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { showSnackbar } = useSnackbar();

  /* ---------------- CONTINUE STEP FROM LOGIN ---------------- */
  useEffect(() => {
    const stepParam = searchParams.get("step");

    if (stepParam === "2") {
      // if user already logged in, preload data
      if (user) {
        setStep(2);
        setFormData({
          userId: user.user_id,
          email: user.email,
          username: user.username,
        });
      } else {
        setStep(1);
        router.push("/register");
      }
    }
  }, [searchParams, user]);

  /* ---------------- BLOCK ACCESS ---------------- */
  useEffect(() => {
    const stepParam = searchParams.get("step");

    if (accessToken && !authLoading) {
      if (stepParam === "2") return; // allow profile completion
      router.replace("/");
    }
  }, [accessToken, authLoading, router, searchParams]);

  /* ---------------- HANDLERS ---------------- */
  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }, []);

  const getHandler = (name) => (e) => {
    handleFieldChange(name, e.target.value);

    if (name === "gender" && !imagePreview) {
      setDefaultPreviewImage(e.target.value);
    }
  };

  /* ---------------- STEP 1 SUBMIT ---------------- */
  const handleStep1 = async (e) => {
    e.preventDefault();

    const fullName = (formData.fullName ?? "").trim();
    const email = (formData.email ?? "").trim();
    const password = (formData.password ?? "").trim();
    const confirmPassword = (formData.confirmPassword ?? "").trim();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    const nextErrors = {};
    if (!fullName) nextErrors.fullName = { status: true, message: "Required" };
    if (!email) nextErrors.email = { status: true, message: "Required" };
    if (!password) {
      nextErrors.password = { status: true, message: "Required" };
    } else if (!passwordRegex.test(password)) {
      nextErrors.password = {
        status: true,
        message:
          "Minimum 8 characters, 1 uppercase letter, 1 lowercase letter and 1 special character letter required",
      };
    }

    if (password !== confirmPassword)
      nextErrors.confirmPassword = { status: true, message: "Not match" };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: { username: fullName, email, password },
      });

      if (data.status && data.step === 2) {
        setIsTransitioning(true);
        setTimeout(() => {
          setAuth(data.data);
          setFormData({
            userId: data.data.userId,
            email: data.data.email,
            username: data.data.generated_username,
          });
          setGeneratedUsername(data.data.generated_username);
          setStep(2);
          setIsTransitioning(false);
        }, 300);
      } else {
        showSnackbar({
          title: "Failed",
          message: data.message,
          variant: "error",
        });
      }
    } catch (err) {
      showSnackbar({
        title: "Failed",
        message: err.message || "Register failed",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STEP 2 SUBMIT ---------------- */
  const handleStep2 = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    const username = formData.username?.trim() ?? "";
    const dateOfBirth = formData.dateOfBirth;
    const gender = formData.gender;

    if (!username)
      nextErrors.username = {
        status: true,
        message: "Username cannot be empty",
      };
    if (!dateOfBirth)
      nextErrors.dateOfBirth = {
        status: true,
        message: "Date of birth cannot be empty",
      };

    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate(),
    );

    if (new Date(dateOfBirth) > minDate) {
      nextErrors.dateOfBirth = {
        status: true,
        message: "Must be 13 years old or older",
      };
    }

    if (!gender) nextErrors.gender = { status: true, message: "Required" };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("userId", formData.userId);
      fd.append("email", formData.email);
      fd.append("username", username);
      fd.append("dateOfBirth", dateOfBirth);
      fd.append("gender", gender);

      if (formData.profileImage) {
        fd.append("profileImage", formData.profileImage);
      }

      await apiFetch(`/auth/register/${generatedUsername || username}`, {
        method: "POST",
        body: fd,
        headers: auth
          ? { Authorization: `Bearer ${auth.access_token}` }
          : undefined,
      });

      setIsTransitioning(true);
      setTimeout(() => {
        setStep(3);
        setIsTransitioning(false);
      }, 300);
    } catch (err) {
      showSnackbar({
        title: "Failed",
        message: err.message || "Register failed",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- AUTO REDIRECT ---------------- */
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  /* ---------------- UI ---------------- */
  return (
    <div className="signup-container">
      <div className="signup-left">
        <Image
          src="/Images/register_photo.png"
          alt=""
          width={450}
          height={520}
        />
      </div>
      <div className="signup-right">
        <h2>
          {step === 1
            ? "Create Account"
            : step === 2
              ? "Complete Profile"
              : "Success"}
        </h2>

        <AppStepper
          steps={[{ label: "" }, { label: "" }, { label: "" }]}
          activeStep={step - 1}
        />

        <div
          className={`step-wrapper ${isTransitioning ? "fade-out" : "fade-in"}`}
        >
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <TextField
                label="Full Name"
                onChange={getHandler("fullName")}
                error={errors.fullName?.status ?? false}
                helperText={errors.fullName?.message ?? ""}
              />
              <TextField
                label="Email"
                onChange={getHandler("email")}
                error={errors.email?.status ?? false}
                helperText={errors.email?.message ?? ""}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                onChange={getHandler("password")}
                error={errors.password?.status ?? false}
                helperText={errors.password?.message ?? ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        style={{ background: "transparent" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                onChange={getHandler("confirmPassword")}
                error={errors.confirmPassword?.status ?? false}
                helperText={errors.confirmPassword?.message ?? ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        style={{ background: "transparent" }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" disabled={loading}>
                SIGN UP
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2}>
              <TextField
                label="Username"
                value={formData.username ?? ""}
                onChange={getHandler("username")}
                error={errors.username?.status ?? false}
                helperText={errors.username?.message ?? ""}
              />

              <TextField
                label="Birthday"
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={getHandler("dateOfBirth")}
                error={errors.dateOfBirth?.status ?? false}
                helperText={errors.dateOfBirth?.message ?? ""}
              />

              <RadioButtons
                name="gender"
                value={formData.gender ?? ""}
                onChange={getHandler("gender")}
                label="Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
                row
                error={errors.gender?.status ?? false}
                helperText={errors.gender?.message ?? ""}
              />
              <TextField
                label="Phone (optional)"
                onChange={getHandler("phoneNumber")}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "SAVING..." : "COMPLETE"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="success-step">
              <CheckCircleOutlineOutlinedIcon fontSize="large" />{" "}
              <h3>Registration Complete 🎉</h3>{" "}
              <p>You will be redirected to login shortly.</p>{" "}
            </div>
          )}
        </div>

        {step === 1 && (
          <Link className="signup" href="/login">
            Already have an account? <span>Login</span>
          </Link>
        )}
        <p className="brand">yukai</p>
      </div>
    </div>
  );
};

export default Register;
