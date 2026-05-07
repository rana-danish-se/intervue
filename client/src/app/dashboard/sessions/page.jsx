"use client";

import Link from "next/link";
import { ClockCounterClockwise, CircleNotch, ArrowRight } from "@phosphor-icons/react";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

function statusLabel(status) {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  if (status === "pending") return "Pending";
  return status || "—";
}

export default function SessionsListPage() {
  const { data, isLoading, error } = useDashboardSummary();
  const recent = data?.recentActivity || [];

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto pb-24 min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <CircleNotch className="w-8 h-8 animate-spin text-[#A3E635]" />
          <p className="text-sm">Loading sessions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-red-400 text-sm">{error}</p>
        <Link href="/dashboard" className="inline-block mt-4 text-[#A3E635] text-sm hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Recent sessions</h1>
          <p className="text-white/50 text-sm">
            Open a session to view details, reports, or continue where you left off.
          </p>
        </div>
        <Link
          href="/dashboard/interviews"
          className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#A3E635] hover:underline"
        >
          My interviews <ArrowRight className="w-4 h-4" weight="bold" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-white/50 text-sm">
          No sessions yet. Create an interview and start practicing.
        </div>
      ) : (
        <ul className="space-y-3">
          {recent.map((activity) => (
            <li key={activity.id}>
              <Link
                href={`/dashboard/sessions/${activity.id}`}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-4 hover:border-[#A3E635]/30 hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className={`w-1.5 h-12 rounded-full shrink-0 ${
                    activity.status === "completed" ? "bg-[#A3E635]" : "bg-white/25"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{activity.title || "Session"}</p>
                  <p className="text-xs text-white/45 mt-0.5">
                    {activity.interviewRole}
                    {" · "}
                    {new Date(activity.updatedAt).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-white/35 mt-1 uppercase tracking-wider">
                    {statusLabel(activity.status)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/50">
                    <ClockCounterClockwise className="w-4 h-4" />
                    View
                  </span>
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-xs ${
                      typeof activity.score === "number"
                        ? "border-[#A3E635]/40 text-[#A3E635]"
                        : "border-white/15 text-white/45"
                    }`}
                  >
                    {typeof activity.score === "number" ? `${activity.score}%` : "—"}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
