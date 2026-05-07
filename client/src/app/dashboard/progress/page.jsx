"use client";

import Link from "next/link";
import { CircleNotch, TrendUp, ChartLineUp } from "@phosphor-icons/react";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

export default function ProgressPage() {
  const { data, isLoading, error } = useDashboardSummary();
  const stats = data?.stats || {};
  const insights = data?.insights || {};
  const interviews = data?.interviews || [];
  const recentActivity = data?.recentActivity || [];

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <CircleNotch className="w-8 h-8 animate-spin text-[#A3E635]" />
          <p className="text-sm">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Progress</h1>
        <p className="text-white/60">Aggregated stats across all your interviews and sessions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Total Interviews</p>
          <p className="text-4xl font-bold text-[#A3E635]">{stats.totalInterviews ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Sessions Completed</p>
          <p className="text-4xl font-bold text-[#A3E635]">{stats.completedSessions ?? 0}</p>
          <p className="text-xs text-white/40 mt-1">of {stats.totalSessions ?? 0} total</p>
        </div>
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Average Score</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-[#A3E635]">
              {typeof stats.avgScore === "number" ? `${stats.avgScore}%` : "N/A"}
            </p>
            <TrendUp className="w-6 h-6 text-[#A3E635] mb-1" weight="bold" />
          </div>
        </div>
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Readiness Score</p>
          <p className="text-4xl font-bold text-[#A3E635]">{stats.readinessScore ?? 0}%</p>
          <p className="text-xs text-white/40 mt-1">{(stats.hiringProbability || "low").toUpperCase()} hiring probability</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#111111] border border-white/5 p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-2">Weakest Topic Identifier</h2>
        <p className="text-white/70 text-sm">
          {insights?.weakestTopic
            ? `${insights.weakestTopic.focus} is your weakest recurring topic (${insights.weakestTopic.avg}/100 average).`
            : "Complete more evaluated sessions to unlock topic-level weakness detection."}
        </p>
        <Link href="/dashboard/final-verdict" className="text-sm text-[#A3E635] font-semibold hover:underline inline-flex items-center gap-1 mt-3">
          Open final verdict <ChartLineUp className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Interview tracks</h2>
          <ul className="space-y-3">
            {interviews.length === 0 ? (
              <li className="text-white/50 text-sm">No interviews yet.</li>
            ) : (
              interviews.map((inv) => (
                <li key={inv._id} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0">
                  <span className="text-white font-medium">{inv.role}</span>
                  <span className="text-white/50">
                    {typeof inv.averageScore === "number" ? `${inv.averageScore}%` : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent sessions</h2>
          <ul className="space-y-3">
            {recentActivity.length === 0 ? (
              <li className="text-white/50 text-sm">No recent activity.</li>
            ) : (
              recentActivity.map((row) => (
                <li key={row.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white">{row.title}</p>
                    <p className="text-[11px] text-white/40">{new Date(row.updatedAt).toLocaleString()}</p>
                  </div>
                  <span className="text-[#A3E635] font-semibold">
                    {typeof row.score === "number" ? `${row.score}%` : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
