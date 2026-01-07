"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getBackendUrl } from "@/utilities/url";
import { useSnackbar } from "./SnackbarContext";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await refreshToken();
        if (token) await getUser(token);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await fetch(getBackendUrl() + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showSnackbar({ message: data.message, variant: "error" });
      throw new Error(data.message);
    }

    setAccessToken(data.data.access_token);
    setUser(data.data);

    return data;
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    await fetch(getBackendUrl() + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
  };

  const refreshToken = async () => {
    const res = await fetch(getBackendUrl() + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      showSnackbar({
        message: data.message || "Refresh failed",
        variant: "error",
      });
      if (
        pathname != "/login" &&
        pathname != "/register" &&
        pathname != "/forget-password"
      ) {
        router.replace("/login");
      }
      throw new Error(data.message || "Token Refresh failed");
    }

    if (!data.status) {
      showSnackbar({
        message: data.message || "Token Refresh failed",
        variant: "error",
      });
      if (
        pathname != "/login" &&
        pathname != "/register" &&
        pathname != "/forget-password"
      )
        router.replace("/login");
    }

    setAccessToken(data.data.access_token);
    return data.data.access_token;
  };

  const getUser = async (token) => {
    if (!token) return;

    const res = await fetch(getBackendUrl() + "/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      showSnackbar({ message: data.message, variant: "error" });
      throw new Error("Failed to load user");
    }

    const data = await res.json();
    setUser(data.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, refreshToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
