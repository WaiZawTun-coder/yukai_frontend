"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import TextField from "@/components/ui/TextField";
import { useApi } from "@/utilities/api";
import Image from "next/image";

const Register = () => {
  const apiFetch = useApi();

  /* ---------------- STATES ---------------- */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward"); // forward | back
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [auth, setAuth] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  /* -------- PREVENT REFRESH ON STEP 2 -------- */
  // useEffect(() => {
  //   if (step === 2 && !auth) {
  //     setStep(1);
  //   }
  // }, [step, auth]);
  const goToStep = (nextStep) => {
    // Guard: cannot go to step 2 without auth
    if (nextStep === 2 && !auth) return;

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

  const getHandler = (name) => (e) => handleFieldChange(name, e.target.value);

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
      nextErrors.confirmPassword = {
        status: true,
        message: "Passwords do not match",
      };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
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
          goToStep(2);
          setIsTransitioning(false);
        }, 300);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- BACK BUTTON ---------------- */
  const handleBack = () => {
    setIsTransitioning(true);
    setDirection("back");

    setTimeout(() => {
      goToStep(1);
      setIsTransitioning(false);
    }, 300);
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

    const fd = new FormData();
    fd.append("userId", formData.userId);
    fd.append("email", formData.email);
    fd.append("username", formData.username);
    fd.append("dateOfBirth", formData.dateOfBirth);
    fd.append("gender", formData.gender);

    if (formData.phoneNumber) {
      fd.append("phoneNumber", formData.phoneNumber);
    }

    if (formData.profileImage) {
      fd.append("profileImage", formData.profileImage);
    }

    try {
      const res = await apiFetch(`/auth/register/${formData.username}`, {
        method: "POST",
        body: fd,
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
        },
      });

      console.log(res);
      // redirect to dashboard
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="signup-container">
      <div className="signup-left"></div>

      <div className="signup-right">
        <h2 className="heading">
          Yukai - {step === 1 ? "Create Account" : "Complete Profile"}
        </h2>
        <hr className="signup-line" />

        <div
          className={`step-wrapper ${
            isTransitioning ? "fade-out" : "fade-in"
          } ${direction}`}
        >
          {/* -------- STEP 1 -------- */}
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <TextField label="Full Name" onChange={getHandler("fullName")} />
              <TextField label="Email" onChange={getHandler("email")} />
              <TextField
                label="Password"
                type="password"
                onChange={getHandler("password")}
              />
              <TextField
                label="Confirm Password"
                type="password"
                onChange={getHandler("confirmPassword")}
              />

              <button type="submit">SIGN UP</button>
            </form>
          )}

          {/* -------- STEP 2 -------- */}
          {step === 2 && (
            <form onSubmit={handleStep2}>
              {/* <button type="button" className="back-btn" onClick={handleBack}>
                ← Back
              </button> */}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="preview"
                  className="profile-preview"
                />
              )}

              <TextField
                label="Username"
                value={formData.username ?? ""}
                onChange={getHandler("username")}
              />

              <TextField
                label="Birthday"
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={getHandler("dateOfBirth")}
              />

              <select
                className="gender-select"
                onChange={getHandler("gender")}
                required
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <TextField
                label="Phone (optional)"
                onChange={getHandler("phoneNumber")}
              />

              <button type="submit">COMPLETE</button>
            </form>
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
