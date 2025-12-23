"use client";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/utilities/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Login = () => {
  const [formData, setFormData] = useState({}); // handle form data
  const [errors, setErrors] = useState({});

  const { login, accessToken, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && !authLoading) {
      router.replace("/");
    }
  }, [accessToken, authLoading, router]);

  // to handle input changes
  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is changed using functional update
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Memoize field change handlers per field name to prevent recreating functions
  const getFieldChangeHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return (e) => handleFieldChange(name, e.target.value);
    },
    [handleFieldChange]
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = (formData.username ?? "").trim();
    const password = (formData.password ?? "").trim();

    let errorCount = 0;

    if (username == "") {
      setErrors((prev) => {
        return {
          ...prev,
          username: { status: true, message: "Username or email is required." },
        };
      });
      errorCount += 1;
    }

    if (password == "") {
      setErrors((prev) => {
        return {
          ...prev,
          password: { status: true, message: "Password is required." },
        };
      });
      errorCount += 1;
    }

    if (errorCount > 0) {
      return;
    }

    const data = { username, password };

    const response = await login(username, password);
    // console.log({ response });
    if (response.status) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 3000);
      return () => clearTimeout(timer);
    }

    // try {
    //   const response = await apiFetch("/auth/login", {
    //     method: "POST",
    //     body: data,
    //   });
    //   console.log({ response });
    //   const timer = setTimeout(() => {
    //     window.location.href = "/";
    //   }, 3000);

    //   return () => clearTimeout(timer);
    // } catch (err) {
    //   console.error(err);
    //   // throw err;
    // }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <Image
          src="/images/loginImage.png"
          alt="loginImage"
          width={450}
          height={520}
        />
      </div>

      <div className="login-right">
        <h2 className="heading">Yukai - Login</h2>
        <hr className="login-line" />

        <form onSubmit={handleLogin}>
          {/* <div className="form-layout"> */}
          <TextField
            label="Username or Email"
            name="usernameOrEmail"
            type="text"
            value={formData.username ?? ""}
            onChange={getFieldChangeHandler("username")}
            required={true}
            error={errors.username?.status ?? false}
            color="accent"
            helperText={errors.username?.message ?? ""}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password ?? ""}
            onChange={getFieldChangeHandler("password")}
            required={true}
            error={errors.password?.status ?? false}
            color="accent"
            helperText={errors.password?.message ?? ""}
          />

          <a href="#" className="forgot">
            forgot password?
          </a>
          <Button type="submit" onClick={handleLogin}>
            LOGIN
          </Button>
          {/* </div> */}
        </form>

        <Link href="/register" className="signup">
          Don’t have an account? <span>signup</span>
        </Link>

        <p className="brand">yukai</p>
      </div>
    </div>
  );
};

export default Login;
