"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

export default function FinalVerdictPage() {
  const { data, isLoading } = useDashboardSummary();
  const stats = data?.stats || {};
  const insights = data?.insights || {};
  const readiness = stats.readinessScore || 0;

  if (isLoading) {
    return <div className="p-8 text-white/60">Generating final verdict...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="bg-[#111111] border border-[#A3E635]/30 rounded-2xl p-8">
        <p className="text-white/40 uppercase text-xs font-semibold tracking-wider">Final Verdict</p>
        <h1 className="text-4xl text-white font-bold mt-2">Hiring Probability: {(stats.hiringProbability || "low").toUpperCase()}</h1>
        <p className="text-[#A3E635] text-2xl font-bold mt-3">Readiness Score: {readiness}%</p>
        <p className="text-white/60 text-sm mt-3">
          This is your aggregate profile across tracks. For domain-specific verdicts and improvement areas, open each interview track detail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-2">Strength Breakdown</h2>
          <p className="text-white/70 text-sm">
            Consistency is strongest when your recent score delta is {typeof stats.scoreDelta === "number" ? `${stats.scoreDelta}%` : "not available"}.
          </p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-2">Weakness Breakdown</h2>
          <p className="text-white/70 text-sm">
            {insights?.weakestTopic
              ? `Weakest recurring topic is ${insights.weakestTopic.focus} (${insights.weakestTopic.avg}/100).`
              : "Weakest topic data appears after more completed sessions."}
          </p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-2">Communication Analysis</h2>
          <p className="text-white/70 text-sm">Confidence, fluency, and clarity are weighted directly into the readiness score.</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-2">Improvement Roadmap</h2>
          <p className="text-white/70 text-sm">
            {insights?.retakeSuggestion
              ? `Retake "${insights.retakeSuggestion.title}" first, then repeat your strongest topic to retain momentum.`
              : "Complete more sessions to unlock a personalized roadmap."}
          </p>
        </div>
      </div>

      <Link href="/dashboard/progress" className="inline-flex text-[#A3E635] hover:underline">
        View full progress analytics
      </Link>
      <Link href="/dashboard/interviews" className="inline-flex ml-4 text-[#A3E635] hover:underline">
        Open interview-specific verdicts
      </Link>
    </div>
  );
}
