"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MicrophoneStage } from "@phosphor-icons/react";

export default function InterviewRoom({ params }) {
  const unwrappedParams = use(params);
  const { id: interviewId, sessionId } = unwrappedParams;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 bg-[#A3E635]/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <MicrophoneStage weight="fill" className="w-12 h-12 text-[#A3E635]" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-4">Live Interview Room</h1>
      <p className="text-white/50 mb-8 max-w-md text-center">
        This is where the live WebRTC audio session will take place. The questions for this session have been securely generated and are ready to go.
      </p>

      <Link 
        href={`/dashboard/interviews/${interviewId}`}
        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Exit Room
      </Link>
    </div>
  );
}
