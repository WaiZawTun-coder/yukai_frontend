"use client";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({}); // handle form data
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, accessToken, loading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    if (accessToken && !authLoading && isLoggedIn) {
      // allow staying on register step 2
      const isRegisterPage = pathname.startsWith("/register");

      if (isRegisterPage) return;
      router.replace("/");
    }
  }, [accessToken, authLoading, isLoggedIn, pathname, router]);

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
    [handleFieldChange],
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

    try {
      setIsLoading(true);
      const response = await login(username, password);
      if (response.status) {
        if (response.two_factor_required) {
          router.replace(`/verify-otp?user=${response.data.user_id}`);
          return;
        }

        if (response.incomplete || response.data?.completed_step < 2) {
          router.replace("/register?step=2");
        }

        router.replace("/");
      } else {
        showSnackbar({
          title: "Login Failed",
          message: response.message ?? "",
          variant: "error",
        });
      }
    } catch (err) {
      showSnackbar({
        title: "Login Failed",
        message: err.message ?? "",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <Image
          src="/Images/loginImage.png"
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
            type={showPassword ? "text" : "password"}
            value={formData.password ?? ""}
            onChange={getFieldChangeHandler("password")}
            required={true}
            error={errors.password?.status ?? false}
            color="accent"
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

          <Link href="/forget-password" className="forgot">
            forgot password?
          </Link>
          <Button type="submit" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "LOGGING IN..." : "LOGIN"}
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
