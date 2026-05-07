function getSessionMetricAverages(session) {
  const questions = session?.questions || [];
  const totals = { confidence: 0, clarity: 0, knowledgeLevel: 0 };
  let count = 0;

  questions.forEach((question) => {
    const stats = question.stats || {};
    if (
      typeof stats.confidence === "number" &&
      typeof stats.clarity === "number" &&
      typeof stats.knowledgeLevel === "number"
    ) {
      totals.confidence += stats.confidence;
      totals.clarity += stats.clarity;
      totals.knowledgeLevel += stats.knowledgeLevel;
      count += 1;
    }
  });

  if (count === 0) {
    return { confidence: 0, clarity: 0, knowledgeLevel: 0, hasData: false };
  }

  return {
    confidence: Math.round(totals.confidence / count),
    clarity: Math.round(totals.clarity / count),
    knowledgeLevel: Math.round(totals.knowledgeLevel / count),
    hasData: true,
  };
}

function getPointPath(points, chartHeight) {
  if (points.length === 0) return "";
  const xStep = points.length > 1 ? 700 / (points.length - 1) : 0;

  return points
    .map((value, index) => {
      const x = 50 + index * xStep;
      const y = 20 + ((100 - value) / 100) * (chartHeight - 40);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function PerformanceMetricsMock({ sessions = [] }) {
  const completedSessions = (sessions || [])
    .filter((session) => session.status === "completed")
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
  const metricRows = completedSessions.map(getSessionMetricAverages).filter((row) => row.hasData);

  const confidencePoints = metricRows.map((row) => row.confidence);
  const clarityPoints = metricRows.map((row) => row.clarity);
  const knowledgePoints = metricRows.map((row) => row.knowledgeLevel);

  const chartHeight = 300;
  const hasChartData = metricRows.length > 0;

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
          <p className="text-xs text-white/40 mt-2">
            Based on completed sessions with evaluated answers.
          </p>
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
        {!hasChartData ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-white/40">
            No evaluated sessions yet. Complete at least one session to view trends.
          </div>
        ) : (
          <>
        {/* Y-Axis Labels */}
        <div className="absolute left-6 top-8 bottom-8 flex flex-col justify-between text-[10px] text-white/30 z-10 hidden sm:flex">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        {/* SVG Wrapper to preserve aspect and stretch nicely */}
        <div className="w-full relative h-[250px] sm:h-[300px] ml-0 sm:ml-8">
          <svg
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
            role="img"
            aria-label="Performance trend chart"
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
              d={getPointPath(knowledgePoints, chartHeight)}
              fill="none"
              stroke="#52525B"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Clarity Line (White) */}
            <path
              d={getPointPath(clarityPoints, chartHeight)}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Confidence Line (Green) */}
            <path
              d={getPointPath(confidencePoints, chartHeight)}
              fill="none"
              stroke="#A3E635"
              strokeWidth="3"
              className="drop-shadow-md"
            />
          </svg>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
