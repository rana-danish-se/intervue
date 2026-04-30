"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  ArrowRight,
  ArrowCounterClockwise,
  X,
  CircleNotch,
  CheckCircle,
  Clock,
  Dot,
} from "@phosphor-icons/react";
import { useInterviewRoom } from "@/hooks/useInterviewRoom";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";

/* ─── Waveform component ─────────────────────────────────────────────────── */
function Waveform({ active, color = "#A3E635" }) {
  return (
    <div className="flex items-end gap-[4px] h-10">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? {
                  height: [8, 32 + Math.random() * 20, 8],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 4, opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          className="w-[4px] rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/* ─── Format Time Helper ─────────────────────────────────────────────────── */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function InterviewRoom({ params }) {
  const { id: interviewId, sessionId } = use(params);
  const router = useRouter();

  const { interview, isLoading: isFetchingDetail } = useInterviewDetail(interviewId);
  const session = interview?.sessions?.find(s => s._id === sessionId);

  const {
    status,
    questions,
    currentQuestion,
    currentIndex,
    isLastQuestion,
    isAiSpeaking,
    isListening,
    liveTranscript,
    transcriptHistory,
    timer,
    startInterview,
    nextQuestion,
    repeatQuestion,
    abandonSession,
    endSession,
  } = useInterviewRoom(sessionId, interviewId);


  const isIdle = status === "idle";
  const isLoading = status === "loading";
  const isDone = status === "done";

  // Auto-scroll transcript
  useEffect(() => {
    const el = document.getElementById("transcript-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcriptHistory, liveTranscript]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white flex flex-col font-sans overflow-hidden">
      
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#0F0F0F] border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <span className="text-[#A3E635] font-black italic tracking-tighter text-xl border-r border-white/10 pr-4">INTERVUE</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">{session?.title || "Live Interview Session"}</span>
            <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase">{session?.focus || "General"}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">Live</span>
          </div>

          <div className="flex items-center gap-2 text-white/90 font-mono text-lg font-bold bg-[#111] px-4 py-1.5 rounded-lg border border-white/10">
            <Clock weight="bold" className="w-5 h-5 text-[#A3E635]" />
            {formatTime(timer)}
          </div>

          <button 
            onClick={isLastQuestion ? endSession : abandonSession}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all"
          >
            {isLastQuestion ? "End Session" : "Exit Session"}
          </button>
        </div>
      </header>

      {/* ─── Main Content Grid ────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-[380px_1fr] overflow-hidden">
        
        {/* Left Sidebar: Live Transcript */}
        <aside className="bg-[#0D0D0D] border-r border-white/5 flex flex-col overflow-hidden relative z-10 shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0F0F0F]">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-white/40 uppercase flex items-center gap-2">
              <Microphone className="w-4 h-4" /> Live Transcript
            </h2>
          </div>
          <div id="transcript-scroll" className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-[#0D0D0D] to-black">
            {transcriptHistory.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${item.role === 'ai' ? 'text-[#A3E635]' : 'text-blue-400'}`}>
                    {item.role === 'ai' ? 'Intervue AI' : 'You'}
                  </span>
                  <span className="text-[9px] text-white/20">{item.timestamp}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{item.text}</p>
              </div>
            ))}
            {isListening && liveTranscript && (
              <div className="space-y-1 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">You</span>
                  <span className="text-[9px] text-white/20">Now</span>
                </div>
                <p className="text-sm text-white/40 italic leading-relaxed bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">{liveTranscript}...</p>
              </div>
            )}
            {transcriptHistory.length === 0 && !liveTranscript && (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="text-xs text-white/20 italic bg-white/5 p-4 rounded-xl border border-white/5">Conversation transcript will appear here once the session begins.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Main Stage */}
        <main className="relative flex flex-col items-center justify-center p-12 bg-black overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#A3E635]/5 rounded-full blur-[150px] pointer-events-none" />

          {isIdle ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center space-y-8 z-10"
            >
              <div className="w-40 h-40 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#A3E635]/5 group-hover:bg-[#A3E635]/10 transition-colors" />
                <Microphone weight="fill" className="w-16 h-16 text-white/10" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight italic">READY TO START?</h1>
                <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                  Join the session for your AI-powered interview. <br/>Your voice will be captured and transcribed in real-time.
                </p>
              </div>
              <button 
                onClick={startInterview}
                className="px-10 py-5 bg-[#A3E635] text-black font-black italic tracking-tighter text-xl rounded-2xl shadow-[0_20px_50px_rgba(163,230,53,0.3)] hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
              >
                <Microphone weight="fill" className="w-6 h-6" /> START INTERVIEW
              </button>
            </motion.div>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-6 z-10">
              <CircleNotch className="w-16 h-16 text-[#A3E635] animate-spin" />
              <p className="text-[#A3E635] text-sm font-bold uppercase tracking-widest animate-pulse">Initializing Session...</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col items-center space-y-12 z-10">
              {/* Question Header */}
              <div className="text-center space-y-4 w-full">
                <div className="flex items-center justify-center gap-4">
                  <h3 className="text-2xl font-black italic tracking-tight text-white/80">Question {currentIndex + 1} of {questions.length}</h3>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/40">{currentIndex < questions.length - 1 ? 'In Progress' : 'Final Question'}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                  {questions.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-full flex-1 border-r border-black last:border-r-0 transition-colors duration-500 ${
                        idx < currentIndex ? 'bg-[#A3E635]/50' : 
                        idx === currentIndex ? 'bg-[#A3E635]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Avatar Stage */}
              <div className="relative group mt-8">
                <div className="absolute -inset-10 bg-[#A3E635]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-64 h-64 rounded-full p-1.5 bg-gradient-to-br from-[#A3E635]/50 to-transparent relative z-10 shadow-[0_0_50px_rgba(163,230,53,0.1)]">
                  <div className="w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden relative shadow-inner">
                    <img 
                      src="/avatar.png" 
                      alt="AI Interviewer" 
                      className={`w-full h-full object-cover transition-all duration-700 ${isAiSpeaking ? 'scale-110' : 'grayscale-[0.4] scale-100'}`}
                    />
                    {isAiSpeaking && (
                      <div className="absolute inset-0 ring-8 ring-[#A3E635]/30 ring-inset rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Visualizer */}
                <div className="mt-10 flex justify-center h-16 items-center">
                  <Waveform active={isAiSpeaking || isListening} color={isAiSpeaking ? "#A3E635" : "#ffffff"} />
                </div>
              </div>

              {/* Question Text */}
              <div className="text-center min-h-[120px] flex items-center justify-center w-full bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-bold leading-relaxed text-white/90 italic"
                  >
                    "{currentQuestion?.questionText}"
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-12 pt-4">
                <button 
                  onClick={repeatQuestion}
                  disabled={isAiSpeaking}
                  className="group flex flex-col items-center gap-3 text-white/30 hover:text-white transition-colors disabled:opacity-10"
                >
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#A3E635]/40 group-hover:text-[#A3E635] group-hover:scale-110 transition-all bg-[#111]">
                    <ArrowCounterClockwise size={24} weight="bold" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Repeat</span>
                </button>

                <div className="relative">
                  {isListening && (
                    <motion.div 
                      layoutId="pulse"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-6 bg-[#A3E635] rounded-full blur-2xl"
                    />
                  )}
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${isListening ? 'bg-[#A3E635] text-black scale-110 shadow-[#A3E635]/30' : 'bg-[#111] text-white/40 border border-white/10 hover:border-white/30 hover:text-white/80'}`}>
                    <Microphone weight="fill" className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
                  </div>
                </div>

                <button 
                  onClick={isLastQuestion ? endSession : nextQuestion}
                  disabled={!isListening}
                  className="group flex flex-col items-center gap-3 text-white/30 hover:text-white transition-colors disabled:opacity-10"
                >
                  <div className={`w-14 h-14 rounded-full border border-white/10 flex items-center justify-center transition-all bg-[#111] group-hover:scale-110 ${isLastQuestion ? 'group-hover:border-green-400 group-hover:text-green-400' : 'group-hover:border-[#A3E635]/40 group-hover:text-[#A3E635]'}`}>
                    {isLastQuestion ? <CheckCircle size={24} weight="bold" /> : <ArrowRight size={24} weight="bold" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">{isLastQuestion ? 'Finish' : 'Next'}</span>
                </button>
              </div>

              {/* Abandon Link */}
              <button 
                onClick={abandonSession}
                className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
              >
                Abandon Session
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
