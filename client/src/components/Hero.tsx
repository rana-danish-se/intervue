"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
      >
        <Sparkles className="w-4 h-4" />
        <span>Next-Gen AI Mock Interviews</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl"
      >
        Talk smarter. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic font-medium">
          Interview faster.
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
      >
        Meet your intelligent AI interviewer that simulates real-world tech and behavioral interviews with live voice, video, and instant feedback.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <button className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-base font-semibold transition-all shadow-[0_0_30px_rgba(163,230,53,0.2)] hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] w-full sm:w-auto justify-center">
          Start Free Mock Interview
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-8 py-4 rounded-full text-base font-semibold transition-all w-full sm:w-auto justify-center">
          <Play className="w-4 h-4" />
          Watch Demo
        </button>
      </motion.div>
    </section>
  );
}
