"use client";

import AuthLoadingScreen from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SectionLoader({ children }) {
  const { loading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn) router.replace("/");
  }, [authLoading, isLoggedIn, router]);

  if (authLoading) return <AuthLoadingScreen text="Loading..." />;

  if (isLoggedIn) return;

  return children;
}
