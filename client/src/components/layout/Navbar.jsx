"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-4 px-4" : "py-6 px-4"
      }`}
    >
      <nav 
        className={`mx-auto max-w-5xl px-6 py-3 flex items-center justify-between rounded-full transition-all duration-300 ${
          scrolled 
            ? "bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border border-transparent"
        }`}
      >
        <Logo />
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard" className="bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] hover:shadow-[0_0_25px_rgba(163,230,53,0.5)] hover:scale-105 active:scale-95 flex items-center gap-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] hover:scale-105 active:scale-95">
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

/**
 * Role: Global Application Navigation Bar
 * What it has: `handleScroll` listens to the browser scroll event and toggles a `scrolled` boolean that switches the navbar between a transparent and a glassmorphic pill-style background. `scrollToSection` intercepts anchor link clicks and uses `scrollIntoView` to smoothly animate the page to the target section by its DOM element ID.
 * Where it is being used: Rendered at the top of `pages/Home.jsx` (landing page) and `components/auth/layout.tsx` (all auth routes), making it globally visible across the application.
 */
