import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, Eye, DotsThreeVertical, BriefcaseMetal, Target, Trash } from "@phosphor-icons/react";

// Map backend experienceLevel values to display labels
const LEVEL_LABELS = {
  junior: "JUNIOR LEVEL",
  mid: "MID LEVEL",
  senior: "SENIOR LEVEL",
};

/** Format an ISO date string into a human-readable relative time string */
function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InterviewCard({ interview, onDelete }) {
  const { _id, role, experienceLevel, jobDescription, goal, createdAt } = interview;
  const levelLabel = LEVEL_LABELS[experienceLevel] ?? experienceLevel.toUpperCase();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative group transition-all hover:border-white/10">
      {/* Options menu */}
      <div className="absolute top-6 right-6" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-white/30 hover:text-white transition-colors p-1"
          title="Options"
          aria-label="Options"
        >
          <DotsThreeVertical weight="bold" className="w-6 h-6" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onDelete?.(_id);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Trash weight="regular" className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="pr-8 mb-5">
        {/* Level badge */}
        <span className="inline-block px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white/60 tracking-wider mb-3">
          {levelLabel}
        </span>

        {/* Role title */}
        <h3 className="text-xl font-bold text-white mb-4">{role}</h3>

        {/* Optional fields */}
        <div className="space-y-2 text-sm text-white/50">
          {jobDescription && (
            <p className="flex items-start gap-2 leading-relaxed">
              <BriefcaseMetal className="w-4 h-4 mt-0.5 text-white/30 flex-shrink-0" />
              <span className="line-clamp-2">{jobDescription}</span>
            </p>
          )}
          {goal && (
            <p className="flex items-start gap-2 leading-relaxed">
              <Target className="w-4 h-4 mt-0.5 text-white/30 flex-shrink-0" />
              <span className="line-clamp-1">{goal}</span>
            </p>
          )}
          {!jobDescription && !goal && (
            <p className="text-white/30 text-xs italic">No description provided</p>
          )}
        </div>
      </div>

      {/* Footer meta */}
      <p className="text-[11px] text-white/30 mb-5">
        Created {formatRelativeDate(createdAt)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href={`/interview/${_id}`}
          className="flex-1 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Play weight="fill" className="w-4 h-4" />
          Start Session
        </Link>
        <Link
          href={`/dashboard/interviews/${_id}`}
          className="flex-1 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Eye weight="bold" className="w-4 h-4" />
          View Details
        </Link>
      </div>
    </div>
  );
}
