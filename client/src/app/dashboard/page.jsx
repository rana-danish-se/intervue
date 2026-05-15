"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { TrendUp, CircleNotch, ArrowRight } from "@phosphor-icons/react";

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: loading } = useDashboardSummary();

  const stats = summary?.stats || {};
  const insights = summary?.insights || {};
  const topInterviews = useMemo(() => summary?.interviews || [], [summary]);
  const recentActivity = useMemo(() => summary?.recentActivity || [], [summary]);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("intervue-onboarding-seen");
      if (!seen) setShowTour(true);
    } catch (_) {}
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    try {
      localStorage.setItem("intervue-onboarding-seen", "1");
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto pb-24 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <CircleNotch className="w-8 h-8 animate-spin text-[#A3E635]" />
          <p className="text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Alex"}
        </h1>
        <p className="text-white/60 text-lg">
          Track your real interview progress and keep improving every session.
        </p>
      </div>
      {showTour && (
        <div className="mb-8 rounded-2xl border border-[#A3E635]/25 bg-[#111111] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#A3E635] uppercase tracking-wider font-semibold mb-2">Quick Onboarding</p>
              <p className="text-white/80 text-sm">Create interview &rarr; Generate sessions &rarr; Attempt live interview &rarr; Review report.</p>
            </div>
            <button onClick={dismissTour} className="text-sm text-[#A3E635] hover:underline">Skip tour</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Total Interviews</p>
          <h2 className="text-5xl font-bold text-[#A3E635]">{stats.totalInterviews || 0}</h2>
        </div>
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Sessions Completed</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">{stats.completedSessions || 0}</h2>
            <span className="text-sm text-white/40 mb-1">of {stats.totalSessions || 0}</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Average Score</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">
              {typeof stats.avgScore === "number" ? `${stats.avgScore}%` : "N/A"}
            </h2>
            <TrendUp className="w-6 h-6 text-[#A3E635] mb-2" weight="bold" />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Hiring Probability</p>
          <h2 className="text-5xl font-bold capitalize" style={{ color: stats.hiringProbability === 'high' ? '#A3E635' : stats.hiringProbability === 'medium' ? '#FBBF24' : '#6B7280' }}>
            {stats.hiringProbability || "low"}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-[#A3E635]/20">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-2">Interview Readiness</p>
          <div className="flex items-end gap-3 mb-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">{stats.readinessScore ?? 0}%</h2>
            <span className="text-white/50 text-sm mb-1 uppercase">{stats.hiringProbability || "low"} hiring probability</span>
          </div>
          <p className="text-white/60 text-sm">
            Updated from performance, consistency, and completion behavior across your recent sessions.
          </p>
          <Link href="/dashboard/final-verdict" className="inline-flex mt-4 text-sm text-[#A3E635] hover:underline">
            Open Final Verdict
          </Link>
        </div>
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-2">Score Delta</p>
          <h2 className={`text-4xl font-bold ${(stats.scoreDelta ?? 0) >= 0 ? "text-[#A3E635]" : "text-orange-400"}`}>
            {typeof stats.scoreDelta === "number" ? `${stats.scoreDelta > 0 ? "+" : ""}${stats.scoreDelta}%` : "--"}
          </h2>
          <p className="text-white/50 text-sm mt-2">Compared with your previous completed session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Your Interviews</h3>
              <Link href="/dashboard/interviews" className="text-sm text-[#A3E635] font-medium hover:underline">
                View All &gt;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topInterviews.map((interview) => (
                <div key={interview._id} className="p-6 rounded-2xl bg-[#111111] border border-white/5 flex flex-col">
                  <h4 className="font-bold text-white text-lg mb-1">{interview.role}</h4>
                  <p className="text-xs text-white/50 mb-6">Experience: {interview.experienceLevel}</p>
                  <div className="flex items-center justify-between text-[11px] text-white/40 mb-6">
                    <div><span className="text-white">{interview.totalSessions || 0}</span> sessions</div>
                    <div>{typeof interview.averageScore === "number" ? `${interview.averageScore}% avg` : "No score yet"}</div>
                  </div>
                  <Link
                    href={interview.nextSessionId ? `/dashboard/sessions/${interview.nextSessionId}` : `/dashboard/interviews/${interview._id}`}
                    className="mt-auto w-full py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors text-center"
                  >
                    Continue
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#111111] border border-white/5 relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-lg">
              <h3 className="text-xl font-bold text-white mb-3">Keep your streak alive</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Continue practicing pending sessions and convert in-progress sessions into completed reports.
              </p>
              <Link href="/dashboard/interviews" className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#A3E635] text-[#A3E635] font-semibold rounded-lg hover:bg-[#A3E635]/10 transition-colors uppercase text-sm tracking-wider">
                Go to interviews <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 bg-[#111111] border border-white/5 p-4 rounded-xl">
                  <div className={`w-1.5 h-10 rounded-full ${activity.status === "completed" ? "bg-[#A3E635]" : "bg-white/20"}`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
                    <p className="text-xs text-white/40 mt-1">{new Date(activity.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-sm ${
                    typeof activity.score === "number"
                      ? "border-[#A3E635]/30 text-[#A3E635]"
                      : "border-white/20 text-white/60"
                  }`}>
                    {typeof activity.score === "number" ? `${activity.score}%` : "--"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-2">Weakest Topic</h4>
            <p className="text-sm text-white/80">
              {insights?.weakestTopic
                ? `${insights.weakestTopic.focus} (${insights.weakestTopic.avg}/100 avg)`
                : "Not enough completed sessions yet."}
            </p>
          </div>
          <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-2">Retake Suggestion</h4>
            <p className="text-sm text-white/60">
              {insights?.retakeSuggestion
                ? `${insights.retakeSuggestion.title} scored ${insights.retakeSuggestion.score}/100. Retake recommended.`
                : "No retake recommendation yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
