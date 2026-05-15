"use client";

/*
Role: Canonical live interview route screen.
What it does: Fetches session metadata and renders the realtime interview surface driven by `useInterviewRoom` state/actions.
Where used: Entry route after starting/continuing a session from dashboard pages.
Why it exists: Provides a production-facing, full-screen interview experience with transcript and answer controls.
*/

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function LiveInterview() {
  const { sessionId } = useParams();
  const transcriptEndRef = useRef(null);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

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
    allAnswersEmpty,
  } = useInterviewRoom(sessionId);

  useEffect(() => {
    let active = true;

    async function fetchSessionMeta() {
      try {
        const { default: axiosInstance } = await import("@/lib/axiosInstance");
        const response = await axiosInstance.get(`/sessions/${sessionId}`);
        if (active) setSessionMeta(response.data);
      } finally {
        if (active) setIsMetaLoading(false);
      }
    }

    fetchSessionMeta();
    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptHistory, liveTranscript]);

  if (isMetaLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <CircleNotch className="w-8 h-8 text-[#A3E635] animate-spin" />
      </div>
    );
  }

  const isIdle = status === "idle";
  const isLoading = status === "loading";
  const isTranscribing = status === "transcribing";

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white flex flex-col font-sans overflow-hidden">
      <header className="flex-shrink-0 h-16 flex items-center justify-between px-8 bg-[#0F0F0F] border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <span className="text-[#A3E635] font-black italic tracking-tighter text-xl border-r border-white/10 pr-4">
            INTERVUE
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">
              {sessionMeta?.title || "Live Interview Session"}
            </span>
            <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase">
              {sessionMeta?.focus || "General"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/90 font-mono text-lg font-bold bg-[#111] px-4 py-1.5 rounded-lg border border-white/10">
            <Clock weight="bold" className="w-5 h-5 text-[#A3E635]" />
            {formatTime(timer)}
          </div>
          <button
            onClick={isLastQuestion ? endSession : abandonSession}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              isLastQuestion
                ? "bg-[#A3E635] text-black hover:bg-[#94d82d]"
                : "bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400"
            }`}
          >
            {isLastQuestion ? "Finish Session" : "Exit Session"}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[360px_1fr] min-h-0 overflow-hidden">
        <aside className="flex flex-col bg-[#0D0D0D] border-r border-white/5 overflow-hidden">
          <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 bg-[#0F0F0F]">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-white/40 uppercase flex items-center gap-2">
              <Microphone className="w-4 h-4" /> Live Transcript
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {transcriptHistory.length === 0 && !liveTranscript && (
              <p className="text-white/20 text-sm italic text-center py-8">
                Transcript will appear here as you speak…
              </p>
            )}
            {transcriptHistory.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${item.role === "ai" ? "text-[#A3E635]" : "text-blue-400"}`}>
                  {item.role === "ai" ? "Intervue AI" : "You"}
                </span>
                <p className="text-sm leading-relaxed p-3 rounded-xl border text-white/70 bg-white/[0.02] border-white/10">
                  {item.text}
                </p>
              </div>
            ))}
            {isListening && liveTranscript && (
              <p className="text-sm text-blue-300 italic bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                {liveTranscript}
              </p>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </aside>

        <main className="relative flex flex-col overflow-hidden bg-black">
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-8 overflow-hidden">
            {isIdle && (
              <div className="flex flex-col items-center text-center space-y-8">
                <h1 className="text-4xl font-black tracking-tight italic">READY TO START?</h1>
                <button
                  onClick={startInterview}
                  className="px-10 py-5 bg-[#A3E635] text-black font-black italic tracking-tighter text-xl rounded-2xl hover:scale-105 transition-all"
                >
                  START INTERVIEW
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center gap-6">
                <CircleNotch className="w-16 h-16 text-[#A3E635] animate-spin" />
                <p className="text-[#A3E635] text-sm font-bold uppercase tracking-widest animate-pulse">
                  Initializing Session...
                </p>
              </div>
            )}

            {isTranscribing && (
              <div className="flex flex-col items-center gap-6">
                <CircleNotch className="w-16 h-16 text-[#A3E635] animate-spin" />
                <p className="text-[#A3E635] text-sm font-bold uppercase tracking-widest animate-pulse">
                  Transcribing...
                </p>
              </div>
            )}

            {!isIdle && !isLoading && !isTranscribing && (
              <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                <div className="w-full space-y-2">
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-1 bg-[#A3E635] transition-all"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black italic tracking-tight text-white/80">
                      Question {currentIndex + 1} <span className="text-white/30 font-normal text-sm">of {questions.length}</span>
                    </h3>
                  </div>
                </div>

                <div className="w-full min-h-[100px] flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <p className="text-xl font-bold leading-relaxed text-white/90 italic text-center">
                    &quot;{currentQuestion?.questionText}&quot;
                  </p>
                </div>

                {!speechUsable && (
                  <div className="w-full flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-left">
                    <Warning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" weight="fill" />
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      Voice recognition needs HTTPS or localhost. Use typed answers below, or deploy behind HTTPS.
                    </p>
                  </div>
                )}

                <div className="w-full flex flex-col gap-3 max-w-2xl">
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
                </div>

                <div className="flex items-center gap-10">
                  <button
                    onClick={repeatQuestion}
                    disabled={isAiSpeaking || isTranscribing}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-[#111] disabled:opacity-20"
                  >
                    <ArrowCounterClockwise size={20} weight="bold" />
                  </button>

                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center ${
                    isListening ? "bg-[#A3E635] text-black" : "bg-[#111] text-white/40 border border-white/10"
                  }`}>
                    <Microphone weight="fill" className={`w-8 h-8 ${isListening ? "animate-pulse" : ""}`} />
                  </div>

                  <button
                    onClick={() => {
                      if (isLastQuestion) {
                        if (allAnswersEmpty) {
                          setShowSkipWarning(true);
                        } else {
                          endSession();
                        }
                      } else {
                        nextQuestion();
                      }
                    }}
                    disabled={isAiSpeaking || isTranscribing}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-[#111] disabled:opacity-20"
                    title={isLastQuestion ? "Finish Session" : "Next Question"}
                  >
                    {isLastQuestion ? <CheckCircle size={20} weight="bold" /> : <ArrowRight size={20} weight="bold" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showSkipWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <Warning size={32} className="text-amber-400" weight="fill" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">No Answers Recorded</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                You haven&apos;t provided any answers for this session. It will be marked as completed with all questions scored 0.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSkipWarning(false)}
                className="flex-1 py-3 border border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={() => {
                  setShowSkipWarning(false);
                  endSession();
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/20"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
