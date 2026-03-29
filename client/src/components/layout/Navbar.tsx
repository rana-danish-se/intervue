"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
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
          <Link href="/auth/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/auth/register" className="bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] hover:scale-105 active:scale-95">
            Start Free Trial
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
