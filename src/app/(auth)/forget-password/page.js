"use client";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Link from "next/link";
import { useCallback, useState } from "react";

const ForgetPassword = () => {
  const [formData, setFormData] = useState({});

  const [email, setEmail] = useState("");
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

  const handleGetOTP = () => {
    console.log({ formData });
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="header">
          <h2>Forgot Password</h2>
        </div>
        <div className="content">
          <div className="outer-box">
            <div className="inner-box">
              <form className="forget-form">
                <TextField
                  label="Enter Email"
                  name="forgetPasswordEmail"
                  type="email"
                  value={email}
                  onChange={getFieldChangeHandler("email")}
                  required={true}
                  error={errors.email?.status ?? false}
                  color="accent"
                  helperText={errors.email?.message ?? ""}
                />
                <Button type="submit" onClick={handleGetOTP} disabled={loading}>
                  {loading ? "Sending" : "Send"} OTP
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="back-link-container">
          <Link href="/login" className="back-text-link">
            {"<<"} Back
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
