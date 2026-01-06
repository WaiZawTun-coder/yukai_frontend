"use client";

import AuthLoadingScreen from "@/components/ui/Loading";
import Sidebar from "@/components/SideBar";
import TopBar from "@/components/TopBar";
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
    return <AuthLoadingScreen text="Authentication Loading..." />;
  }

  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
