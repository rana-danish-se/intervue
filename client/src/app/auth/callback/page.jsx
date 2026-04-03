"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleNotch } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {

    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {

        router.replace("/auth/login?error=auth_failed");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-white"
      >
        <CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xl font-medium tracking-tight">Authenticating securely...</p>
        <p className="text-sm text-muted-foreground">Please wait a moment while we set things up.</p>
      </motion.div>
    </div>
  );
}

/**
 * Role: OAuth Callback Handler
 * What it has: 1 function
 * What it is doing: The `AuthCallbackPage` function listens to the global `authStore` loading state. Once the hydrator completes checking the session, it evaluates if the user successfully authenticated and routes them to the `/dashboard`. If authentication failed, it redirects them back to `/auth/login`.
 * Where it is being used: Used by Next.js specifically to handle users returning from an external OAuth provider (like Google) at the `/auth/callback` route.
 */
