"use client";

import { getBackendUrl } from "@/utilities/url";
import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh token on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshToken();
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    const res = await fetch(getBackendUrl() + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // important for HttpOnly cookie
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();
    setAccessToken(data.data.access_token);
    setUser({
      username: data.data.username,
      email: data.data.email,
      displayUsername: data.data.display_username,
    });
  };

  // Logout function
  const logout = () => {
    setAccessToken(null);
    setUser(null);
    // Optionally call backend to invalidate refresh token
    fetch(getBackendUrl() + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  // Refresh access token
  const refreshToken = async () => {
    const res = await fetch(getBackendUrl() + "/auth/refresh", {
      method: "POST",
      credentials: "include", // send HttpOnly cookie
    });

    if (!res.ok) {
      setAccessToken(null);
      setUser(null);
      throw new Error("Could not refresh token");
    }

    const data = await res.json();
    setAccessToken(data.data.access_token);
    return data.data.access_token;
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, refreshToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access
export const useAuth = () => useContext(AuthContext);
