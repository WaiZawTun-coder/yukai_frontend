"use client";

import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SectionLoader({ children }) {
  const { loading: authLoading, isLoggedIn, hasKeys, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn && user && user.completed_step == 2) router.replace("/");
  }, [authLoading, isLoggedIn, router, user]);

  if (authLoading && !hasKeys) return <AuthLoadingScreen text="Loading..." />;

  if (isLoggedIn && user && user.completed_step == 2) return;

  return children;
}
