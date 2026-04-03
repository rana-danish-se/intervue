"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, WarningCircle, Info, X } from "@phosphor-icons/react";
import { useToastStore } from "@/store/toastStore";

export default function Toast() {
  const { message, type, isVisible, hideToast } = useToastStore();
  const hasPlayedSound = useRef(false);

  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (err) {
      console.warn("Audio Context failed to play pop sound: ", err);
    }
  };

  useEffect(() => {
    if (isVisible && !hasPlayedSound.current) {
      playPopSound();
      hasPlayedSound.current = true;
    } else if (!isVisible) {
      hasPlayedSound.current = false;
    }
  }, [isVisible]);

  const config = {
    success: {
      icon: <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />,
      border: "border-green-500/30",
      bg: "bg-green-500/10",
    },
    error: {
      icon: <XCircle weight="fill" className="w-5 h-5 text-red-500" />,
      border: "border-red-500/30",
      bg: "bg-red-500/10",
    },
    warning: {
      icon: <WarningCircle weight="fill" className="w-5 h-5 text-orange-400" />,
      border: "border-orange-500/30",
      bg: "bg-orange-500/10",
    },
    info: {
      icon: <Info weight="fill" className="w-5 h-5 text-blue-400" />,
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
    },
  };

  const currentConfig = config[type] || config.success;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 w-80 text-white ${currentConfig.border} ${currentConfig.bg} bg-black/60`}>
            <div className="shrink-0">{currentConfig.icon}</div>
            <p className="text-sm font-medium leading-tight flex-1 tracking-tight">
              {message}
            </p>
            <button
              onClick={hideToast}
              className="shrink-0 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Role: Global Animated Toast Notification UI
 * What it has: `playPopSound` synthesizes a short 100ms pitched-down sine wave sound through the Web Audio API to produce the notification pop effect without loading any external audio file. The `useEffect` watches the `isVisible` state from `useToastStore` and triggers `playPopSound` once per toast appearance using a `hasPlayedSound` ref to prevent duplicate sounds.
 * Where it is being used: Mounted globally inside `app/auth/layout.tsx`, rendering a fixed bottom-right overlay notification visible on all authentication routes.
 */
