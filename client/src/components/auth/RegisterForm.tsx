"use client";

import { motion } from "framer-motion";
import { EnvelopeSimple, LockKey, User, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function RegisterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. Mode: Signup");
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
            Create an account
          </motion.h2>
          <p className="text-muted-foreground text-sm">
            Set up your profile and start practicing today.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all mb-6 group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.74 22.37 10.04H12V14.22H17.93C17.67 15.56 16.91 16.7 15.76 17.47V20.24H19.33C21.41 18.32 22.56 15.53 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.33 20.24L15.76 17.47C14.75 18.15 13.48 18.56 12 18.56C9.13 18.56 6.7 16.63 5.82 14.04H2.15V16.89C3.96 20.49 7.68 23 12 23Z" fill="#34A853"/>
            <path d="M5.82 14.04C5.59 13.37 5.46 12.65 5.46 11.91C5.46 11.17 5.59 10.45 5.82 9.78V6.93H2.15C1.41 8.41 1 10.1 1 11.91C1 13.72 1.41 15.41 2.15 16.89L5.82 14.04Z" fill="#FBBC05"/>
            <path d="M12 5.26C13.62 5.26 15.06 5.82 16.2 6.9L19.41 3.69C17.45 1.87 14.97 0.81 12 0.81C7.68 0.81 3.96 3.32 2.15 6.93L5.82 9.78C6.7 7.19 9.13 5.26 12 5.26Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center mb-6">
          <div className="grow border-t border-white/10" />
          <span className="shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">
            Or continue with email
          </span>
          <div className="grow border-t border-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
            <div className="relative">
              <User weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="John Doe"
                required
                className="w-full bg-black/50 border border-white/10 text-white placeholder:text-white/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
            <div className="relative">
              <EnvelopeSimple weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="email" 
                placeholder="you@example.com"
                required
                className="w-full bg-black/50 border border-white/10 text-white placeholder:text-white/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <LockKey weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-black/50 border border-white/10 text-white placeholder:text-white/20 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] group"
          >
            Create Account
            <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
