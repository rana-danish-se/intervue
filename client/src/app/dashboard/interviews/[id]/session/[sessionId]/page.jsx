"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, CircleNotch, WarningCircle, MicrophoneStage, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";
import AbandonedSessionView from "@/components/interviews/session/AbandonedSessionView";
import CompletedSessionReport from "@/components/interviews/session/CompletedSessionReport";

export default function PreSessionLobby({ params }) {
  const unwrappedParams = use(params);
  const { id: interviewId, sessionId } = unwrappedParams;
  
  const router = useRouter();
  
  const { interview, isLoading: isFetching, error, refetch } = useInterviewDetail(interviewId);

  const session = interview?.sessions?.find(s => s._id === sessionId);

  // Poll for updates if the session is currently processing
  useEffect(() => {
    let intervalId;
    if (session?.status === 'processing') {
      intervalId = setInterval(() => {
        refetch(false); // fetch without global loader
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [session?.status, refetch]);

  if (isFetching && !interview) {
    return (
      <div className="p-8 max-w-4xl mx-auto pb-24 min-h-[60vh] flex flex-col items-center justify-center">
        <CircleNotch weight="bold" className="w-8 h-8 text-[#A3E635] animate-spin mb-4" />
        <p className="text-white/50 text-sm animate-pulse">Loading lobby...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="p-8 max-w-4xl mx-auto pb-24 text-center mt-20">
        <WarningCircle weight="fill" className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to load interview</h2>
        <Link href="/dashboard/interviews" className="text-sm text-white/50 hover:text-white underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 max-w-4xl mx-auto pb-24 text-center mt-20">
        <WarningCircle weight="fill" className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Session not found</h2>
        <Link href={`/dashboard/interviews/${interviewId}`} className="text-sm text-white/50 hover:text-white underline">
          Return to Interview Details
        </Link>
      </div>
    );
  }

  const handleStartSession = () => {
    router.push(`/dashboard/interviews/${interviewId}/session/${sessionId}/room`);
  };


  const renderContent = () => {
    if (session.status === 'abandoned') {
      return <AbandonedSessionView session={session} interviewId={interviewId} />;
    }

    if (session.status === 'completed') {
      return (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{session.title}</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#A3E635]"></span>
              <span className="text-sm font-medium text-white/80">Focus: {session.focus || "General"}</span>
            </div>
          </div>
          <CompletedSessionReport session={session} />
        </div>
      );
    }

    if (session.status === 'processing') {
      return (
        <div className="bg-[#111111] border border-[#A3E635]/20 rounded-3xl p-16 flex flex-col items-center justify-center text-center mt-10">
          <CircleNotch weight="bold" className="w-12 h-12 text-[#A3E635] animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">AI is evaluating your session</h2>
          <p className="text-white/50 text-sm max-w-sm">
            Please wait while we process your answers and generate detailed feedback. This may take a minute.
          </p>
        </div>
      );
    }

    // Default: pending / in-progress
    return (
      <div className="bg-[#111111] border border-white/5 rounded-3xl p-10 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-[#A3E635]/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#A3E635]/10 border border-[#A3E635]/20 rounded-2xl flex items-center justify-center mb-6">
            <Brain weight="fill" className="w-8 h-8 text-[#A3E635]" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            {session.title}
          </h1>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-sm font-medium text-white/80">Focus: {session.focus || "General"}</span>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Guidelines</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MicrophoneStage className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Audio-Only Interview</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Your camera will remain off. Ensure you are in a quiet environment and your microphone is permitted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Blind Curriculum</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  To preserve the integrity of the mock interview, the 5 personalized questions are generated in real-time and kept secret until the AI asks them.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Take Your Time</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  You can pause between questions. The AI will evaluate your fluency, confidence, and knowledge after you finish speaking.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-white/40">
              Estimated duration: <span className="text-white">~15 mins</span>
            </p>
            
            <button
              onClick={handleStartSession}
              className="px-8 py-4 bg-[#A3E635] text-black font-bold rounded-xl hover:bg-[#b5f040] transition-colors flex items-center gap-2"
            >
              Enter Interview Room
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <Link 
        href={`/dashboard/interviews/${interviewId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interview
      </Link>

      {renderContent()}
    </div>
  );
}
