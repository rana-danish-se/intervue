"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EnvelopeSimple, LockKey, ArrowRight, CircleNotch, Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import GoogleButton from "./GoogleButton";

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [urlMessage, setUrlMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      router.push("/dashboard");
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("session_expired")) {
      setUrlMessage({ type: "warning", text: "Your session has expired. Please log in again securely." });
    } else if (params.get("verified")) {
      setUrlMessage({ type: "success", text: "Email successfully verified! You can now log in." });
    }
  }, [router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await authService.login(data);
      setAuthData(response.user);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Top middle semicircle glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-100 h-100 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2 tracking-tight"
          >
            Welcome back
          </motion.h2>
          <p className="text-muted-foreground text-sm">
            Enter your details to sign in to Intervue.
          </p>
        </div>

        {/* Extracted Google OAuth Button Component */}
        <GoogleButton />

        <div className="relative flex items-center mb-6">
          <div className="grow border-t border-white/10" />
          <span className="shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">
            Or continue with email
          </span>
          <div className="grow border-t border-white/10" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* URL Status Messages */}
          {urlMessage && urlMessage.type === "success" && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg text-center">
              {urlMessage.text}
            </div>
          )}
          {urlMessage && urlMessage.type === "warning" && (
            <div className="bg-orange-500/10 border border-orange-500/50 text-orange-400 text-sm p-3 rounded-lg text-center">
              {urlMessage.text}
            </div>
          )}

          {/* Form Error Message */}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-white/80">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required"
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
            className="w-full mt-2 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don&apos;t have an account?{" "}
          <Link 
            href="/auth/register"
            className="text-white hover:text-primary font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
