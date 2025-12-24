"use client";

import Sidebar from "@/components/SideBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const { accessToken, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken && !authLoading) {
      router.replace("/login");
    }
  }, [accessToken, authLoading, router]);
  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
