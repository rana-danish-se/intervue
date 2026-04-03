"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LockKey, ArrowRight, CircleNotch, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useParams, useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const showToast = useToastStore((state) => state.showToast);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("newPassword");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      await authService.resetPassword(token, data.newPassword);
      showToast("Password reset successfully! Redirecting...", "success");
      router.push("/auth/login");
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid or expired token. Please try again.");
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
            Create New Password
          </motion.h2>
          <p className="text-muted-foreground text-sm">
            Enter your new password below to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {apiError}
              </div>
            )}

            <div className="space-y-4">

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">New Password</label>
                <div className="relative">
                  <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("newPassword", { 
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    })}
                    className={`w-full bg-black/50 border ${errors.newPassword ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-white/20 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <EyeSlash weight="bold" className="w-5 h-5" />
                    ) : (
                      <Eye weight="bold" className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword.message}</p>}
              </div>


              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Confirm New Password</label>
                <div className="relative">
                  <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    className={`w-full bg-black/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-white/20 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash weight="bold" className="w-5 h-5" />
                    ) : (
                      <Eye weight="bold" className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>
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
                  Save New Password
                  <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              <Link 
                href="/auth/login"
                className="text-white hover:text-primary font-medium transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </form>
      </div>
    </div>
  );
}

/**
 * Role: Password Reset Interface
 * What it has: 2 functions
 * What it is doing: The `onSubmit` function evaluates the submitted passwords and calls `authService.resetPassword` using the URL token to securely update the user's credentials. The `ResetPasswordPage` component renders the interface, manages matching validation state between the two password input fields, and handles UI error feedback.
 * Where it is being used: Mounted by Next.js dynamically at `/auth/reset-password/[token]` when a user clicks a secure email link.
 */
