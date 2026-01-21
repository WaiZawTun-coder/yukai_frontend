"use client";

import RadioButtons from "@/components/ui/RadioButton";
import TextField from "@/components/ui/TextField";
import AppStepper from "@/components/ui/AppStepper";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";

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

  const { showSnackbar } = useSnackbar();

  /* ---------------- CONTINUE STEP FROM LOGIN ---------------- */
  useEffect(() => {
    const stepParam = searchParams.get("step");

    if (stepParam === "2") {
      setStep(2);

      // if user already logged in, preload data
      if (user) {
        setFormData({
          userId: user.user_id,
          email: user.email,
          username: user.username,
        });
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

    const nextErrors = {};
    if (!fullName) nextErrors.fullName = { status: true, message: "Required" };
    if (!email) nextErrors.email = { status: true, message: "Required" };
    if (!password) nextErrors.password = { status: true, message: "Required" };
    if (password !== confirmPassword)
      nextErrors.confirmPassword = { status: true, message: "Not match" };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: { username: fullName, email, password },
      });

      if (res.status && res.step === 2) {
        setIsTransitioning(true);
        setTimeout(() => {
          setAuth(res.data);
          setFormData({
            userId: res.data.userId,
            email: res.data.email,
            username: res.data.generated_username,
          });
          setGeneratedUsername(res.data.generated_username);
          setStep(2);
          setIsTransitioning(false);
        }, 300);
      } else {
        showSnackbar({
          title: "Failed",
          message: res.message,
          variant: "error",
        });
      }
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
      today.getDate()
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
        {/* <Image src="" alt="" width={100} height={100} /> */}
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
              <Button type="submit">SIGN UP</Button>
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
          <Link href="/login">Already have an account? Login</Link>
        )}
      </div>
    </div>
  );
};

export default Register;
