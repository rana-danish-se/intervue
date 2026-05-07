import { Play, CaretDown, CalendarBlank, ClockCounterClockwise, Question } from "@phosphor-icons/react";
import Link from "next/link";

const LEVEL_LABELS = {
  junior: "JUNIOR",
  mid: "MID",
  senior: "SENIOR",
};

export default function InterviewDetailHeader({ interview }) {
  const { _id, role, experienceLevel, sessions = [] } = interview || {};
  
  const levelLabel = LEVEL_LABELS[experienceLevel] || experienceLevel?.toUpperCase() || "UNKNOWN";
  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const lastPracticedAt =
    sessions.length > 0
      ? sessions.reduce(
          (latest, session) =>
            new Date(session.updatedAt) > new Date(latest) ? session.updatedAt : latest,
          sessions[0].updatedAt
        )
      : null;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 mb-8 relative flex flex-col md:flex-row md:items-start justify-between gap-6">
      
      {/* Left Column: Title & Metadata */}
      <div>
        {/* Badges */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/50 tracking-wider">
              LEVEL: <span className="text-white/80">{levelLabel}</span>
            </span>
          </div>
          <div className="text-[10px] font-bold text-[#A3E635] tracking-wider uppercase">
            Active Track
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {role || "Unknown Role"}
        </h1>

        {/* Footer Meta */}
        <div className="flex items-center gap-6 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <CalendarBlank className="w-5 h-5 text-white/30" />
            {completedSessions} sessions completed
          </div>
          <div className="flex items-center gap-2">
            <ClockCounterClockwise className="w-5 h-5 text-white/30" />
            {lastPracticedAt ? `Last practiced ${new Date(lastPracticedAt).toLocaleDateString()}` : "Not practiced yet"}
          </div>
          <div className="flex items-center gap-2">
            <Question className="w-5 h-5 text-white/30" />
            5 questions per session
          </div>
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="flex flex-col items-end gap-3 min-w-[200px] shrink-0 mt-2 md:mt-0">
        <Link
          href={`/interview/${_id}`}
          className="w-full py-3.5 px-6 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.15)]"
        >
          <Play weight="bold" className="w-4 h-4" />
          Start New Session
        </Link>
        <button className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wider hover:text-white transition-colors mt-2">
          View Details
          <CaretDown weight="bold" className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
}
