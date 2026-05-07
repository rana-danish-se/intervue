"use client";

/*
Role: Dashboard-scoped live interview room route.
What it does: Renders the interactive interview room UI using shared interview-room hook state (question flow, transcript, controls).
Where used: Entered from interview detail/session history paths.
Why it exists: Preserves dashboard navigation context while running a full live interview experience.
*/

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  ArrowRight,
  ArrowCounterClockwise,
  CircleNotch,
  CheckCircle,
  Clock,
  Keyboard,
  Warning,
} from "@phosphor-icons/react";
import { useInterviewRoom } from "@/hooks/useInterviewRoom";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";

/* ─── Waveform component ─────────────────────────────────────────────────── */
function Waveform({ active, color = "#A3E635" }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? {
                  height: [6, 24 + (i % 3) * 8, 6],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 3, opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 0.5 + (i % 5) * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.03,
                }
              : { duration: 0.3 }
          }
          className="w-[3px] rounded-full flex-shrink-0"
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
  const transcriptEndRef = useRef(null);

  const { interview, isLoading: isFetchingDetail } = useInterviewDetail(interviewId);
  const session = interview?.sessions?.find((s) => s._id === sessionId);

  const {
    status,
    questions,
    currentQuestion,
    currentIndex,
    isLastQuestion,
    isAiSpeaking,
    isListening,
    liveTranscript,
    typedAnswer,
    setTypedAnswer,
    inputMode,
    setInputMode,
    speechUsable,
    transcriptHistory,
    timer,
    startInterview,
    nextQuestion,
    repeatQuestion,
    abandonSession,
    endSession,
  } = useInterviewRoom(sessionId);

  const isIdle = status === "idle";
  const isLoading = status === "loading";

  // Auto-scroll transcript to bottom whenever content changes
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptHistory, liveTranscript]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white flex flex-col font-sans overflow-hidden">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-16 flex items-center justify-between px-8 bg-[#0F0F0F] border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <span className="text-[#A3E635] font-black italic tracking-tighter text-xl border-r border-white/10 pr-4">
            INTERVUE
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">
              {session?.title || "Live Interview Session"}
            </span>
            <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase">
              {session?.focus || "General"}
            </span>
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

      {/* ─── Main Content Grid ─────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-[360px_1fr] min-h-0 overflow-hidden">

        {/* ── Left Sidebar: Live Transcript ─────────────────────────────────── */}
        <aside className="flex flex-col bg-[#0D0D0D] border-r border-white/5 overflow-hidden">
          {/* Panel Header — fixed, never moves */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 bg-[#0F0F0F] flex items-center justify-between">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-white/40 uppercase flex items-center gap-2">
              <Microphone className="w-4 h-4" /> Live Transcript
            </h2>
            {isListening && (
              <span className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Recording
              </span>
            )}
            {isAiSpeaking && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#A3E635] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
                AI Speaking
              </span>
            )}
          </div>

          {/* Scrollable transcript body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
            {transcriptHistory.length === 0 && !liveTranscript && (
              <div className="h-full flex items-center justify-center text-center px-4 py-12">
                <p className="text-xs text-white/20 italic bg-white/5 p-4 rounded-xl border border-white/5">
                  Conversation transcript will appear here once the session begins.
                </p>
              </div>
            )}

            {transcriptHistory.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      item.role === "ai" ? "text-[#A3E635]" : "text-blue-400"
                    }`}
                  >
                    {item.role === "ai" ? "Intervue AI" : "You"}
                  </span>
                  <span className="text-[9px] text-white/20">{item.timestamp}</span>
                </div>
                <p
                  className={`text-sm leading-relaxed p-3 rounded-xl border ${
                    item.role === "ai"
                      ? "text-white/70 bg-[#A3E635]/5 border-[#A3E635]/10"
                      : "text-white/70 bg-blue-500/5 border-blue-500/10"
                  }`}
                >
                  {item.text}
                </p>
              </div>
            ))}

            {/* Live interim transcript — only shown while actively listening and has content */}
            {isListening && liveTranscript && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    You
                  </span>
                  <span className="text-[9px] text-white/30 italic">typing…</span>
                </div>
                <p className="text-sm text-white/40 italic leading-relaxed bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 border-dashed">
                  {liveTranscript}
                  <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
                </p>
              </div>
            )}

            {/* Sentinel for auto-scroll */}
            <div ref={transcriptEndRef} />
          </div>
        </aside>

        {/* ── Right Side: Main Stage ─────────────────────────────────────────── */}
        <main className="relative flex flex-col overflow-hidden bg-black">
          {/* Ambient glow — purely decorative, pointer-events-none */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#A3E635]/5 rounded-full blur-[150px] pointer-events-none" />

          {/* Centered content area — flex-1 ensures it fills remaining height */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-8 overflow-hidden">

            {/* ── IDLE state ──────────────────────────────────────────────── */}
            {isIdle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="w-36 h-36 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#A3E635]/5 group-hover:bg-[#A3E635]/10 transition-colors" />
                  <Microphone weight="fill" className="w-14 h-14 text-white/10" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-black tracking-tight italic">READY TO START?</h1>
                  <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                    Join the session for your AI-powered interview. <br />
                    Your voice will be captured and transcribed in real-time.
                  </p>
                </div>
                <button
                  onClick={startInterview}
                  className="px-10 py-5 bg-[#A3E635] text-black font-black italic tracking-tighter text-xl rounded-2xl shadow-[0_20px_50px_rgba(163,230,53,0.3)] hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Microphone weight="fill" className="w-6 h-6" /> START INTERVIEW
                </button>
              </motion.div>
            )}

            {/* ── LOADING state ─────────────────────────────────────────────── */}
            {isLoading && (
              <div className="flex flex-col items-center gap-6">
                <CircleNotch className="w-16 h-16 text-[#A3E635] animate-spin" />
                <p className="text-[#A3E635] text-sm font-bold uppercase tracking-widest animate-pulse">
                  Initializing Session...
                </p>
              </div>
            )}

            {/* ── ACTIVE interview state ─────────────────────────────────────── */}
            {!isIdle && !isLoading && (
              <div className="w-full max-w-2xl flex flex-col items-center gap-8">

                {/* Progress bar — fixed height, never causes shift */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black italic tracking-tight text-white/80">
                      Question {currentIndex + 1}{" "}
                      <span className="text-white/30 font-normal text-sm">of {questions.length}</span>
                    </h3>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/40">
                      {currentIndex < questions.length - 1 ? "In Progress" : "Final Question"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-full flex-1 border-r border-black/40 last:border-r-0 transition-colors duration-500 ${
                          idx < currentIndex
                            ? "bg-[#A3E635]/50"
                            : idx === currentIndex
                            ? "bg-[#A3E635]"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Avatar — fixed size, no layout shift */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-8 bg-[#A3E635]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="w-48 h-48 rounded-full p-1.5 bg-gradient-to-br from-[#A3E635]/50 to-transparent shadow-[0_0_50px_rgba(163,230,53,0.1)]">
                    <div className="w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden relative shadow-inner">
                      <img
                        src="/avatar.png"
                        alt="AI Interviewer"
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isAiSpeaking ? "scale-110" : "grayscale-[0.4] scale-100"
                        }`}
                      />
                      {isAiSpeaking && (
                        <div className="absolute inset-0 ring-8 ring-[#A3E635]/30 ring-inset rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Waveform — fixed height container prevents layout jump */}
                  <div className="mt-4 flex justify-center h-8 items-end">
                    <Waveform
                      active={isAiSpeaking || isListening}
                      color={isAiSpeaking ? "#A3E635" : "#60a5fa"}
                    />
                  </div>
                </div>

                {/* Question text — fixed min-height so transitions don't shift controls */}
                <div className="w-full min-h-[100px] flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-xl font-bold leading-relaxed text-white/90 italic text-center"
                    >
                      "{currentQuestion?.questionText}"
                    </motion.p>
                  </AnimatePresence>
                </div>

                {!speechUsable && (
                  <div className="w-full flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-left">
                    <Warning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" weight="fill" />
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      Voice recognition needs a secure connection (HTTPS) or localhost. Use typed answers, or open this page over HTTPS after deployment.
                    </p>
                  </div>
                )}

                <div className="w-full flex flex-col gap-3">
                  <div className="flex rounded-xl border border-white/10 p-1 bg-black/40">
                    <button
                      type="button"
                      onClick={() => setInputMode("voice")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                        inputMode === "voice"
                          ? "bg-[#A3E635] text-black"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      <Microphone className="w-4 h-4" weight="bold" />
                      Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("type")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                        inputMode === "type"
                          ? "bg-[#A3E635] text-black"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      <Keyboard className="w-4 h-4" weight="bold" />
                      Type
                    </button>
                  </div>
                  <label className="block w-full">
                    <span className="sr-only">Your answer</span>
                    <textarea
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      placeholder={
                        inputMode === "type"
                          ? "Type your answer…"
                          : "Optional: add detail or fix transcript…"
                      }
                      rows={inputMode === "type" ? 5 : 3}
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40 min-h-[88px]"
                    />
                  </label>
                </div>

                {/* Controls row — always same height, no conditional rendering that shifts layout */}
                <div className="flex items-center gap-10">
                  {/* Repeat */}
                  <button
                    onClick={repeatQuestion}
                    disabled={isAiSpeaking}
                    className="group flex flex-col items-center gap-2 text-white/30 hover:text-white transition-colors disabled:opacity-10 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#A3E635]/40 group-hover:text-[#A3E635] group-hover:scale-110 transition-all bg-[#111]">
                      <ArrowCounterClockwise size={20} weight="bold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Repeat</span>
                  </button>

                  {/* Mic indicator — purely visual, not a button */}
                  <div className="relative flex-shrink-0">
                    {isListening && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-6 bg-[#A3E635] rounded-full blur-2xl pointer-events-none"
                      />
                    )}
                    <div
                      className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${
                        isListening
                          ? "bg-[#A3E635] text-black scale-105 shadow-[0_0_40px_rgba(163,230,53,0.4)]"
                          : isAiSpeaking
                          ? "bg-[#111] text-white/20 border border-white/5"
                          : "bg-[#111] text-white/40 border border-white/10"
                      }`}
                    >
                      <Microphone
                        weight="fill"
                        className={`w-8 h-8 ${isListening ? "animate-pulse" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Next / Finish */}
                  <button
                    onClick={isLastQuestion ? endSession : nextQuestion}
                    disabled={isAiSpeaking}
                    className="group flex flex-col items-center gap-2 text-white/30 hover:text-white transition-colors disabled:opacity-10 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all bg-[#111] group-hover:scale-110 ${
                        isLastQuestion
                          ? "group-hover:border-green-400 group-hover:text-green-400"
                          : "group-hover:border-[#A3E635]/40 group-hover:text-[#A3E635]"
                      }`}
                    >
                      {isLastQuestion ? (
                        <CheckCircle size={20} weight="bold" />
                      ) : (
                        <ArrowRight size={20} weight="bold" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {isLastQuestion ? "Finish" : "Next"}
                    </span>
                  </button>
                </div>

                {/* Abandon link */}
                <button
                  onClick={abandonSession}
                  className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                >
                  Abandon Session
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
