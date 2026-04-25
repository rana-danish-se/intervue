"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, WarningCircle, CircleNotch } from "@phosphor-icons/react";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";
import InterviewDetailHeader from "@/components/interviews/detail/InterviewDetailHeader";
import PerformanceMetricsMock from "@/components/interviews/detail/PerformanceMetricsMock";
import SessionHistory from "@/components/interviews/detail/SessionHistory";

export default function InterviewDetailPage({ params }) {
  // Using React's new `use` hook to unwrap params in Next.js 15+ if needed, 
  // or simple destructuring for standard Next.js 13/14
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const { interview, isLoading, error, refetch } = useInterviewDetail(id);

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto pb-24 min-h-[60vh] flex flex-col items-center justify-center">
        <CircleNotch weight="bold" className="w-8 h-8 text-[#A3E635] animate-spin mb-4" />
        <p className="text-white/50 text-sm animate-pulse">Loading interview details...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="p-8 max-w-5xl mx-auto pb-24">
        <Link href="/dashboard/interviews" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Interviews
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <WarningCircle weight="fill" className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to load interview</h2>
          <p className="text-red-400/80 text-sm">{error || "Interview not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
       {/* Top Navigation */}
      <div className="mb-6">
        <Link 
          href="/dashboard/interviews" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interviews
        </Link>
      </div>

      <InterviewDetailHeader interview={interview} />
      
      <PerformanceMetricsMock />
      
      <SessionHistory 
        interviewId={interview._id} 
        sessions={interview.sessions} 
        refetch={refetch} 
      />

    </div>
  );
}
