"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EnvelopeSimple, ArrowRight, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useToastStore } from "@/store/toastStore";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await authService.forgotPassword(data.email);
      showToast(response.message || "Reset link sent! Please check your email.", "success");
      router.push("/auth/login");
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">

      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-100 h-100 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2 tracking-tight"
          >
            Reset Password
          </motion.h2>
          <p className="text-muted-foreground text-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
              <div className="relative">
                <EnvelopeSimple weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" }
                  })}
                  className={`w-full bg-black/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-white/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Remembered your password?{" "}
              <Link 
                href="/auth/login"
                className="text-white hover:text-primary font-medium transition-colors"
              >
                Log in
              </Link>
            </p>
          </form>
      </div>
    </div>
  );
}

/**
 * Role: Forgot Password Interface
 * What it has: 2 functions
 * What it is doing: The `onSubmit` function evaluates the submitted email and dispatches a request to the `authService` to generate a reset link, triggering a global toast notification on completion. The `ForgotPasswordPage` function renders the UI form module and securely manages local input states and API errors.
 * Where it is being used: Mounted by Next.js at the `/auth/forgot-password` route.
 */
