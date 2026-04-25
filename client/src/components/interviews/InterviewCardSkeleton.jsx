/** Animated placeholder card shown while interviews are loading */
export default function InterviewCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 space-y-3">
          {/* Level badge */}
          <div className="h-5 w-24 bg-white/10 rounded-full" />
          {/* Role title */}
          <div className="h-7 w-52 bg-white/10 rounded-lg" />
          {/* Meta rows */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-40 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        </div>
        {/* Circular score placeholder */}
        <div className="w-20 h-20 rounded-full bg-white/10 flex-shrink-0" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-8">
        <div className="flex-1 h-12 bg-white/10 rounded-xl" />
        <div className="flex-1 h-12 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
