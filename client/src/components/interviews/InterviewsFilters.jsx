import { CaretDown } from "@phosphor-icons/react";

const STATUS_TABS = ["ALL", "ACTIVE", "COMPLETED"];

export default function InterviewsFilters({ activeStatus, onStatusChange }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-b border-white/10 py-6 mb-8">
      <div className="flex flex-wrap items-center gap-8">
        {/* Role filter */}
        <div>
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
            Filter by role
          </label>
          <div className="flex items-center justify-between bg-[#111111] border border-white/10 rounded-lg px-4 py-2 min-w-[200px] cursor-pointer hover:border-white/20 transition-colors">
            <span className="text-sm text-white/90">All Interview Roles</span>
            <CaretDown className="w-4 h-4 text-white/50" />
          </div>
        </div>

        {/* Status tabs */}
        <div>
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex items-center bg-[#111111] border border-white/10 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => onStatusChange?.(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeStatus === tab
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 text-right">
          Sort by
        </label>
        <div className="flex items-center justify-between gap-3 text-sm text-white/90 cursor-pointer">
          Latest Practice <CaretDown className="w-4 h-4 text-white/50" />
        </div>
      </div>
    </div>
  );
}
