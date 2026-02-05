"use client";

import FloatingCall from "@/components/FloatingCall";
import { MessageNotifications } from "@/components/MessageNotification";
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

  if (authLoading && !hasKeys) {
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
