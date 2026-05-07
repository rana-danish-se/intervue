"use client";

// Removed React server-component hook usage in client; params come in via props
import Link from "next/link";
import { ArrowLeft, WarningCircle, CircleNotch } from "@phosphor-icons/react";
import { useInterviewDetail } from "@/hooks/useInterviewDetail";
import InterviewDetailHeader from "@/components/interviews/detail/InterviewDetailHeader";
import PerformanceMetricsMock from "@/components/interviews/detail/PerformanceMetricsMock";
import SessionHistory from "@/components/interviews/detail/SessionHistory";

import { useParams } from 'next/navigation';

export default function InterviewDetailPage() {
  const params = useParams();
  const id = params?.id;
  
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
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded bg-white text-black font-semibold">Retry</button>
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

      {interview?.verdict && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-[#A3E635]/20 rounded-2xl p-5">
            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Track Readiness</p>
            <p className="text-3xl font-bold text-[#A3E635]">{interview.verdict.readinessScore ?? 0}%</p>
            <p className="text-xs text-white/50 mt-1">{(interview.verdict.hiringProbability || "low").toUpperCase()} hiring probability for this track</p>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Improvement Areas</p>
            <p className="text-sm text-white/80 capitalize">
              {interview.verdict.improvementAreas?.length
                ? interview.verdict.improvementAreas.join(", ")
                : "Complete more sessions to unlock detailed improvement areas."}
            </p>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Recommended Retake</p>
            <p className="text-sm text-white/80">
              {interview.verdict.weakestSession
                ? `${interview.verdict.weakestSession.title} (${interview.verdict.weakestSession.score}/100)`
                : "No retake recommendation yet."}
            </p>
          </div>
        </div>
      )}
      
      <PerformanceMetricsMock sessions={interview.sessions || []} />
      
      <SessionHistory 
        interviewId={interview._id} 
        sessions={interview.sessions} 
        refetch={refetch} 
      />

    </div>
  );
}
