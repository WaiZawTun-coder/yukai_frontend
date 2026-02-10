"use client";

import RightBar from "@/components/RightBar";
import Sidebar from "@/components/SideBar";
import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({ children }) {
  const { loading: authLoading, isLoggedIn, user, hasKeys } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (user && Number(user.completed_step) !== 2 && pathname !== "/register") {
      router.replace("/register?step=2");
    }
  }, [authLoading, isLoggedIn, user, pathname, router]);

  if (authLoading)
    return <AuthLoadingScreen text="Authentication Loading..." />;

  if (!isLoggedIn) return null;

  if (user && Number(user.completed_step) !== 2 && pathname !== "/register") {
    return null;
  }

  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content">{children}</main>
      <RightBar />
    </div>
  );
}
