"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleNotch, CheckCircle, XCircle } from "@phosphor-icons/react";
import { authService } from "@/services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your secure token...");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!params?.token || hasFetched.current) return;
    hasFetched.current = true;
    const verify = async () => {
      try {
        await authService.verifyEmail(params.token);
        setStatus("success");
        setMessage("Email verified successfully! Redirecting you to login...");
        

        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired token. Please try registering again.");
      }
    };

    verify();
  }, [params, router]);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">
        

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-100 h-100 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 relative z-10"
          >
            <CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Verifying Email...</h2>
            <p className="text-muted-foreground">{message}</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 relative z-10"
          >
            <CheckCircle weight="fill" className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Verified!</h2>
            <p className="text-green-400 font-medium">{message}</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 relative z-10"
          >
            <XCircle weight="fill" className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Verification Failed</h2>
            <p className="text-red-400">{message}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              Return to Login
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Role: Email Verification Handler
 * What it has: 2 functions
 * What it is doing: The `verify` async function explicitly calls the backend `verifyEmail` service using the URL token parameters. The `VerifyEmailPage` component manages the animated loading states UI (loading, success, error) and automatically redirects the user to the login screen after a successful database update.
 * Where it is being used: Rendered dynamically by Next.js at `/auth/verify/[token]` when a user clicks the verify link sent to their email.
 */
