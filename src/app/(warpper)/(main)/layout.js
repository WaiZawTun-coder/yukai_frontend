"use client";

import FloatingCall from "@/components/FloatingCall";
import { MessageNotifications } from "@/components/MessageNotification";
import RightBar from "@/components/RightBar";
import Sidebar from "@/components/SideBar";
import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { BusyProvider } from "@/context/BusyContext";
import { CallProvider } from "@/context/CallContext";
import { NotificationProvider } from "@/context/NotificationContext";
import SocketInitializer from "@/utilities/SocketInitializer";
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

    if (user && user.completed_step < 2 && pathname !== "/register") {
      router.replace("/register?step=2");
      return;
    }
  }, [authLoading, isLoggedIn, user, pathname, router]);

  if (authLoading && !hasKeys) {
    return <AuthLoadingScreen text="Authentication Loading..." />;
  }

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      
      <div className="main-layout-container">
        <Sidebar />
        <main className="main-content">{children}</main>
        <RightBar />
      </div>
    </>
  );
}