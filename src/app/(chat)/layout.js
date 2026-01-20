"use client";

import RightBar from "@/components/RightBar";
import Sidebar from "@/components/SideBar";
import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { loading: authLoading, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;

    // not logged in → login
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    // logged in but profile incomplete → register step 2
    if (user && user.completed_step < 2 && pathname !== "/register") {
      router.replace("/register?step=2");
      return;
    }
  }, [authLoading, isLoggedIn, user, pathname, router]);

  if (authLoading) {
    return <AuthLoadingScreen text="Authentication Loading..." />;
  }

  if (!isLoggedIn) return null;

  return (
    <div className="main-layout-container">
      <main className="main-content-chat" id="main-content">
        {children}
      </main>
    </div>
  );
}
