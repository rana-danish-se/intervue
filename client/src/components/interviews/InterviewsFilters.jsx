import { CaretDown } from "@phosphor-icons/react";

const STATUS_TABS = ["ALL", "ACTIVE", "COMPLETED"];

export default function InterviewsFilters({
  activeStatus,
  onStatusChange,
  roleFilter,
  onRoleFilterChange,
  roleOptions = [],
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-b border-white/10 py-6 mb-8">
      <div className="flex flex-wrap items-center gap-8">
        {/* Role filter */}
        <div>
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
            Filter by role
          </label>
          <div className="relative min-w-[220px]">
            <select
              value={roleFilter}
              onChange={(event) => onRoleFilterChange?.(event.target.value)}
              className="w-full appearance-none bg-[#111111] border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white/90 hover:border-white/20 transition-colors"
            >
              <option value="all">All Interview Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <CaretDown className="w-4 h-4 text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
