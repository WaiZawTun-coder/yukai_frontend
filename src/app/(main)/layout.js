"use client";

import Sidebar from "@/components/SideBar";
import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { accessToken, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken && !authLoading && !user) {
      router.replace("/login");
    }
  }, [accessToken, authLoading, router, user, pathname]);

  if (authLoading || !accessToken) {
    return <AuthLoadingScreen text="Authentication Loading..." />;
  }

  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content" id="main-content">
        {children}
      </main>
    </div>
  );
}
