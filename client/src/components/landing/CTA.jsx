"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function CTA() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-22 relative overflow-hidden  ">
      {/* Intense center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] -z-10 rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
        >
          {isAuthenticated ? "Keep practicing." : "Start practicing today."} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">It&apos;s free.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Stop memorizing answers. Start having real conversations that build genuine confidence.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            href={isAuthenticated ? "/dashboard" : "/auth/register"} 
            className="group relative inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-full text-lg font-medium hover:text-white/80 hover:border-white/20 transition-all shadow-[0_0_40px_rgba(163,230,53,0.3)] hover:shadow-[0_0_60px_rgba(163,230,53,0.5)] scale-105 hover:scale-110"
          >
            {isAuthenticated ? "Go to Dashboard" : "Create Your Free Account"}
            <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Inner glow ring on hover */}
            <div className="absolute inset-0 rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
