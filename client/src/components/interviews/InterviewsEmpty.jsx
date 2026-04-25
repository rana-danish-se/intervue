import Link from "next/link";
import { Plus, ClipboardText } from "@phosphor-icons/react";

/** Shown in the interview grid when the user has no interviews yet */
export default function InterviewsEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <ClipboardText className="w-8 h-8 text-white/20" />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">No interviews yet</h3>
      <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-6">
        Create your first AI-powered mock interview to start tracking your progress and
        improving your skills.
      </p>

      <Link
        href="/dashboard/interviews/create"
        className="flex items-center gap-2 px-5 py-2.5 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors text-sm"
      >
        <Plus weight="bold" className="w-4 h-4" />
        Create Your First Interview
      </Link>
    </div>
  );
}
