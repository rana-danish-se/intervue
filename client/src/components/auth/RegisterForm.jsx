"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EnvelopeSimple, LockKey, User, ArrowRight, CircleNotch, Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import GoogleButton from "./GoogleButton";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      router.push("/dashboard");
    }
  }, [router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    setApiSuccess("");
    
    try {
      const response = await authService.register(data);
      setApiSuccess(response.message || "Registration successful! Please check your email.");
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
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
            Create an account
          </motion.h2>
          <p className="text-muted-foreground text-sm">
            Set up your profile and start practicing today.
          </p>
        </div>

        <GoogleButton />

        <div className="relative flex items-center mb-6">
          <div className="grow border-t border-white/10" />
          <span className="shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">
            Or continue with email
          </span>
          <div className="grow border-t border-white/10" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg text-center">
              {apiSuccess}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
            <div className="relative">
              <User weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="John Doe"
                {...register("name", { required: "Name is required" })}
                className={`w-full bg-black/50 border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-white/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={`w-full bg-black/50 border ${errors.password ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-white/20 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`}
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
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link 
            href="/auth/login"
            className="text-white hover:text-primary font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Role: Registration Form UI and Submission Handler
 * What it has: `onSubmit` sends the user's name, email, and password to `authService.register`, displays a success message prompting email verification, or surfaces an API error if registration fails. The inline `useEffect` redirects already-authenticated users away from the register page directly to `/dashboard`.
 * Where it is being used: Rendered by the `RegisterPage` route at `/auth/register`.
 */
