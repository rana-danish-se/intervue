"use client";

import { motion } from "framer-motion";
import {
  Sparkle,
  ArrowRight,
  Play,
  ChatTeardropText,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const transcriptLines = [
  "So, tell me about a time you had to optimize a slow application.",
  "I noticed a 30% latency drop in our user auth flow, so I profiled the DB queries...",
  "Excellent approach. Did you consider caching the session data?",
  "Yes! We implemented Redis which brought the P99 down to 45ms.",
];

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) =>
        prev < transcriptLines.length ? prev + 1 : prev,
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
      >
        <Sparkle weight="duotone" className="w-4 h-4" />
        <span>Next-Gen AI Mock Interviews</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl"
      >
        Talk smarter. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 font-semibold">
          Interview faster.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
      >
        Meet your intelligent AI interviewer that simulates real-world tech and
        behavioral interviews with live voice, video, and instant feedback.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link 
          href={isAuthenticated ? "/dashboard" : "/auth/register"} 
          className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-base font-semibold transition-all shadow-[0_0_30px_rgba(163,230,53,0.2)] hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] w-full sm:w-auto justify-center"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          <ArrowRight
            weight="bold"
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
          />
        </Link>
        <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-8 py-4 rounded-full text-base font-semibold transition-all w-full sm:w-auto justify-center">
          <Play weight="fill" className="w-4 h-4" />
          See How It Works
        </button>
      </motion.div>

      {/* Hero Animated Visual */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-16 w-full max-w-3xl border border-white/10 bg-black/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl overflow-hidden relative"
      >
        {/* Absolute glow behind the transcript window */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ChatTeardropText
              weight="duotone"
              className="w-5 h-5 text-primary"
            />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Live Interview</h3>
            <p className="text-xs text-primary font-mono tracking-wider">
              AI AGENT LISTENING...
            </p>
          </div>
        </div>

        <div className="space-y-4 text-left font-mono text-sm max-h-[220px] overflow-hidden">
          {transcriptLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={
                index < visibleLines
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -10 }
              }
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg max-w-[85%] ${
                index % 2 === 0
                  ? "bg-white/5 border border-white/10 text-white"
                  : "bg-primary/10 border border-primary/20  text-neutral-500 ml-auto"
              }`}
            >
              {line}
            </motion.div>
          ))}
          {visibleLines >= transcriptLines.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              className="text-muted-foreground italic mt-4 text-xs"
            >
              AI is analyzing response...
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
