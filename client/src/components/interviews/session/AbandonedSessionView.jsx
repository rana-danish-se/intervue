"use client";

import { WarningCircle, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";
import { useState } from "react";

export default function AbandonedSessionView({ session, interviewId }) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [isLoading, setIsLoading] = useState(false);

  const handleReconduct = async () => {
    setIsLoading(true);
    try {
      // In a full implementation, you might want an API route to reset the session
      // For now, we'll just navigate to the room. The room logic can handle overwriting
      // or we just set the status back to pending.
      // Let's assume there's a backend endpoint to reset, or we just push to the room
      // If we just push to the room, the room will start a new session attempt.
      router.push(`/dashboard/interviews/${interviewId}/session/${session._id}/room`);
    } catch (error) {
      console.error(error);
      showToast("Failed to reconduct session", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-red-500/20 rounded-3xl p-10 relative overflow-hidden text-center mt-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-red-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
          <WarningCircle weight="fill" className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">Session Abandoned</h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          It looks like you left the interview room before completing this session. 
          Your progress was not saved. You can choose to reconduct this session to try again.
        </p>

        <button
          onClick={handleReconduct}
          disabled={isLoading}
          className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
        >
          <ArrowCounterClockwise className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "Starting..." : "Reconduct Session"}
        </button>
      </div>
    </div>
  );
}
