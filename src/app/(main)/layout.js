"use client";

import Sidebar from "@/components/SideBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { accessToken, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken && !authLoading) {
      router.replace("/login");
    }
  }, [accessToken, authLoading, router]);

  if (authLoading || !accessToken) {
    return <div className="auth-loading-screen">Loading...</div>;
  }

  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
