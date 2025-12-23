"use client";

import RadioButtons from "@/components/ui/RadioButton";
import TextField from "@/components/ui/TextField";
import AppStepper from "@/components/ui/AppStepper";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// icons
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Register = () => {
  const apiFetch = useApi();

  const { accessToken, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && !authLoading) {
      router.replace("/");
    }
  }, [accessToken, authLoading, router]);

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

  /* ---------------- STEP CONTROL ---------------- */
  const goToStep = (nextStep) => {
    setStep(nextStep);
  };

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

    const nextErrors = {};
    if (!fullName)
      nextErrors.fullName = { status: true, message: "Fullname is required" };
    if (!email)
      nextErrors.email = { status: true, message: "Email is required" };
    if (!password)
      nextErrors.password = { status: true, message: "Password is required" };
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = {
        status: true,
        message: "Passwords do not match",
      };
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = {
        status: true,
        message: "Confirm password is required",
      };
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: {
          username: fullName,
          email,
          password,
        },
      });

      if (res.status && res.step === 2) {
        setIsTransitioning(true);
        setDirection("forward");

        setTimeout(() => {
          setAuth(res.data);
          setFormData({
            userId: res.data.userId,
            email: res.data.email,
            username: res.data.generated_username,
          });
          setGeneratedUsername(res.data.generated_username);
          goToStep(2);
          setIsTransitioning(false);
        }, 300);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((p) => ({ ...p, profileImage: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ---------------- STEP 2 SUBMIT ---------------- */
  const handleStep2 = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const nextErrors = {};

      const username = formData.username?.trim() ?? "";
      const dateOfBirth = formData.dateOfBirth ?? null;
      const gender = formData.gender?.trim() ?? "";

      if (!username) {
        nextErrors.username = { status: true, message: "Username is required" };
      }
      if (!dateOfBirth) {
        nextErrors.dateOfBirth = {
          status: true,
          message: "Date of birth is required",
        };
      }
      if (!gender) {
        nextErrors.gender = { status: true, message: "Gender is required" };
      }

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      const fd = new FormData();
      fd.append("userId", formData.userId);
      fd.append("email", formData.email);
      fd.append("username", username);
      fd.append("dateOfBirth", dateOfBirth);
      fd.append("gender", gender);

      if (formData.phoneNumber) {
        fd.append("phoneNumber", formData.phoneNumber);
      }

      if (formData.profileImage) {
        fd.append("profileImage", formData.profileImage);
      }

      await apiFetch(`/auth/register/${generatedUsername}`, {
        method: "POST",
        body: fd,
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
        },
      });

      // move to final step
      setIsTransitioning(true);
      setDirection("forward");

      setTimeout(() => {
        goToStep(3);
        setIsTransitioning(false);
      }, 300);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- AUTO REDIRECT ---------------- */
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  /* ---------------- UI ---------------- */
  return (
    <div className="signup-container">
      <div className="signup-left"></div>

      <div className="signup-right">
        <h2 className="heading">
          Yukai -{" "}
          {step === 1
            ? "Create Account"
            : step === 2
            ? "Complete Profile"
            : "Success"}
        </h2>

        {/* -------- STEP INDICATOR -------- */}
        {/* <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-dot ${step >= s ? "active" : ""}`}>
              {s}
            </div>
          ))}
        </div> */}
        <AppStepper
          steps={[{ label: "" }, { label: "" }, { label: "" }]}
          activeStep={step - 1}
        />

        <hr className="signup-line" />

        <div
          className={`step-wrapper ${
            isTransitioning ? "fade-out" : "fade-in"
          } ${direction}`}
        >
          {/* -------- STEP 1 -------- */}
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
                type="password"
                onChange={getHandler("password")}
                error={errors.password?.status ?? false}
                helperText={errors.password?.message ?? ""}
              />
              <TextField
                label="Confirm Password"
                type="password"
                onChange={getHandler("confirmPassword")}
                error={errors.confirmPassword?.status ?? false}
                helperText={errors.confirmPassword?.message ?? ""}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "CREATING..." : "SIGN UP"}
              </Button>
            </form>
          )}

          {/* -------- STEP 2 -------- */}
          {step === 2 && (
            <form onSubmit={handleStep2}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
                id="profileImage"
              />

              <div className="profile-image-container">
                <label htmlFor="profileImage" className="image-preview">
                  <Image
                    src={
                      imagePreview ??
                      `/images/default-profiles/${defaultPreviewImage}.jpg`
                    }
                    alt="preview"
                    width={75}
                    height={75}
                    className="profile-preview"
                  />
                  <div className="profile-image-change-icon">
                    <AutorenewOutlinedIcon />
                  </div>
                </label>
              </div>

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
                error={errors.dateOfBirth?.status ?? false}
                helperText={errors.dateOfBirth?.message ?? ""}
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

          {/* -------- STEP 3 -------- */}
          {step === 3 && (
            <div className="success-step">
              <CheckCircleOutlineOutlinedIcon fontSize="large" />
              <h3>Registration Complete 🎉</h3>
              <p>You will be redirected to login shortly.</p>
            </div>
          )}
        </div>

        {step === 1 && (
          <Link href="/login" className="signin">
            Already have an account? <span>Login</span>
          </Link>
        )}

        <p className="brand">愉快</p>
      </div>
    </div>
  );
};

export default Register;
