"use client";

import { motion } from "framer-motion";
import { Play, VideoCamera, Microphone, CheckCircle } from "@phosphor-icons/react";

export default function DemoPreview() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Glow background behind demo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[150px] -z-10 pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            See it in action
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            A sneak peek at the interview interface and the detailed debrief report you receive afterward.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Mock Interview UI Browser Window */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col"
          >
            {/* Fake browser bar */}
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="mx-auto bg-black/50 border border-white/5 px-24 py-1 rounded text-xs text-white/40 h-6 flex items-center">
                app.intervue.com/session
              </div>
            </div>

            {/* Content area: Fake UI wrapper to be replaced by a real GIF/Video later */}
            <div className="p-6 flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
              {/* Replace the content below with a real <video> or <img> when ready */}
              <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20"></div>
                <div className="absolute -inset-2 border border-primary rounded-full animate-pulse opacity-10"></div>
                <Microphone weight="duotone" className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2 tracking-tight">AI Interviewer listening</h3>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                &quot;Tell me about your experience scaling distributed systems under heavy load.&quot;
              </p>
              
              <button className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-colors border border-white/5">
                <VideoCamera weight="fill" className="w-3 h-3" /> Turn on camera
              </button>
            </div>
          </motion.div>

          {/* Mock Debrief Report */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl overflow-hidden p-8 flex flex-col justify-center"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Debrief Report</h3>
                <p className="text-muted-foreground text-sm">Senior Frontend Engineer Role</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold text-primary">82<span className="text-xl text-muted-foreground font-normal">/100</span></div>
                <p className="text-xs text-emerald-400 font-medium">Top 15%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/5 bg-black/30">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                     <CheckCircle weight="fill" className="w-4 h-4 text-emerald-400" /> System Design
                   </h4>
                   <span className="text-xs font-mono text-emerald-400">Excellent</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strong architecture answer regarding Redis caching. Consider mentioning invalidation strategies next time.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-white/5 bg-black/30">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                     <CheckCircle weight="fill" className="w-4 h-4 text-yellow-400" /> React Performance
                   </h4>
                   <span className="text-xs font-mono text-yellow-400">Average</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Missed answering the question about useMemo internals. Detailed review link attached.
                </p>
              </div>
            </div>
            
            <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors">
              View Full Report
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
