"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Mic, Video, Sparkles, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  return (
    <section className="relative z-10 px-6 pb-32 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative rounded-2xl border border-border/50 bg-secondary/30 backdrop-blur-xl p-2 shadow-2xl overflow-hidden"
      >
        {/* Top Bar of the Mockup */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/50 rounded-t-xl">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-auto text-xs font-medium text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Interview Session
          </div>
        </div>
        
        {/* Mockup Content */}
        <div className="grid md:grid-cols-3 gap-4 p-4 min-h-[400px]">
          {/* AI Video Feed Simulation */}
          <div className="md:col-span-2 rounded-xl bg-background/80 border border-border/50 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center relative shadow-lg">
                <BrainCircuit className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 z-20">
              <p className="font-medium text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Eva (AI Interviewer)
              </p>
              <p className="text-sm text-gray-300 max-w-md mt-1">
                "That is an excellent approach to the system design question. Now, how would you handle horizontal scaling in this scenario?"
              </p>
            </div>
          </div>

          {/* Sidebar / Code / Controls */}
          <div className="flex flex-col gap-4">
            {/* User Video feed */}
            <div className="h-40 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute right-3 top-3 bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1 backdrop-blur-md">
                 REC
               </div>
               <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            
            {/* Real-time Feedback Stream */}
            <div className="flex-1 rounded-xl bg-background/80 border border-border/50 p-4 flex flex-col">
              <h3 className="text-sm font-bold text-foreground mb-4">Real-time Analysis</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm bg-secondary/50 p-3 rounded-lg border border-border/50">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Tone:</strong> Confident and clear pacing.</span>
                </div>
                <div className="flex items-start gap-2 text-sm bg-secondary/50 p-3 rounded-lg border border-border/50">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Clarity:</strong> Good explanation of the CAP theorem.</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                 <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
                      <Mic className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
                      <Video className="w-4 h-4 text-foreground" />
                    </button>
                 </div>
                 <button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold px-4 py-2 rounded-full transition-colors">
                   End Session
                 </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
