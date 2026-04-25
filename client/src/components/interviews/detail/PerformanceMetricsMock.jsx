export default function PerformanceMetricsMock() {
  return (
    <div className="mb-12">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-bold text-[#A3E635] tracking-wider uppercase mb-1">
            Performance Metrics
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Progress Over Time
          </h2>
        </div>
        
        <div className="flex items-center gap-5 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]"></span>
            Confidence
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            Clarity
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52525B]"></span>
            Knowledge
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative w-full overflow-hidden">
        {/* Y-Axis Labels */}
        <div className="absolute left-6 top-8 bottom-8 flex flex-col justify-between text-[10px] text-white/30 z-10 hidden sm:flex">
          <span>10.0</span>
          <span>7.5</span>
          <span>5.0</span>
          <span>2.5</span>
          <span>0.0</span>
        </div>

        {/* SVG Wrapper to preserve aspect and stretch nicely */}
        <div className="w-full relative h-[250px] sm:h-[300px] ml-0 sm:ml-8">
          <svg
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
            role="img"
            aria-label="Mock performance line chart"
          >
            {/* Grid Lines */}
            <g stroke="currentColor" className="text-white/5" strokeWidth="1">
              <line x1="0" y1="20" x2="800" y2="20" />
              <line x1="0" y1="85" x2="800" y2="85" />
              <line x1="0" y1="150" x2="800" y2="150" />
              <line x1="0" y1="215" x2="800" y2="215" />
              <line x1="0" y1="280" x2="800" y2="280" />
            </g>

            {/* Knowledge Line (Gray) */}
            <path
              d="M 50 250 L 200 230 L 350 210 L 500 180 L 650 170 L 800 160"
              fill="none"
              stroke="#52525B"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Clarity Line (White) */}
            <path
              d="M 50 280 L 200 240 L 350 170 L 500 150 L 650 140 L 800 100"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Confidence Line (Green) */}
            <path
              d="M 50 260 L 200 210 L 350 220 L 500 130 L 650 110 L 800 60"
              fill="none"
              stroke="#A3E635"
              strokeWidth="3"
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
