import Link from "next/link";
import { Plus } from "@phosphor-icons/react";

export default function InterviewsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Interview History</h1>
        <p className="text-white/60 text-sm">
          Track your progress and refine your skills with AI-powered mock sessions.
        </p>
      </div>

      <Link
        href="/dashboard/interviews/create"
        className="flex items-center gap-2 px-6 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors whitespace-nowrap"
      >
        <Plus weight="bold" className="w-5 h-5" />
        Create New Interview
      </Link>
    </div>
  );
}
