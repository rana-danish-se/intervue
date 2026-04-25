"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, CircleNotch, WarningCircle, MicrophoneStage, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";

export default function PreSessionLobby({ params }) {
  const unwrappedParams = use(params);
  const { id: interviewId, sessionId } = unwrappedParams;
  
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  
  const { interview, isLoading: isFetching, error } = useInterviewDetail(interviewId);
  const [isGenerating, setIsGenerating] = useState(false);

  if (isFetching) {
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

  const session = interview.sessions?.find(s => s._id === sessionId);

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

  const handleStartSession = async () => {
    setIsGenerating(true);
    
    try {
      // Trigger JIT Question Generation
      await sessionService.generateQuestions(sessionId);
      
      // Navigate to the live room once generation is complete
      router.push(`/dashboard/interviews/${interviewId}/session/${sessionId}/room`);
    } catch (err) {
      console.error(err);
      showToast("Failed to prepare session questions. Please try again.", "error");
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      <Link 
        href={`/dashboard/interviews/${interviewId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interview
      </Link>

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
              disabled={isGenerating}
              className="px-8 py-4 bg-[#A3E635] text-black font-bold rounded-xl hover:bg-[#94d82d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
