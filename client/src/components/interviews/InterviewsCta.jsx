import Link from "next/link";
import { RocketLaunch } from "@phosphor-icons/react";

export default function InterviewsCta() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden">
      <RocketLaunch weight="fill" className="w-12 h-12 text-[#A3E635] mx-auto mb-4" />

      <h2 className="text-xl font-bold text-white mb-2">Ready for a new challenge?</h2>
      <p className="text-white/60 max-w-md mx-auto mb-8 text-sm leading-relaxed">
        Create a tailored interview experience for any role. Our AI analyzes your speech patterns
        and industry knowledge in real-time.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link
          href="/dashboard/interviews/create"
          className="px-8 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors"
        >
          Launch Custom Session
        </Link>
        <button className="px-8 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
          Browse Templates
        </button>
      </div>
    </div>
  );
}
