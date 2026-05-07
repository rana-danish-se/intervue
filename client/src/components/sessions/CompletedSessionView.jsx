import React from 'react';
import { CheckCircle, ChatCircleText, ChartLineUp, CaretDown } from '@phosphor-icons/react';
import { scoreFromStats } from '@/lib/metrics/sessionMetrics';

export default function CompletedSessionView({ session }) {
  const questions = session?.questions || [];
  const validStats = questions
    .map((question) => question.stats || {})
    .filter(
      (stats) =>
        typeof stats.confidence === 'number' &&
        typeof stats.knowledgeLevel === 'number' &&
        typeof stats.relevance === 'number' &&
        typeof stats.fluency === 'number' &&
        typeof stats.clarity === 'number'
    );

  const averageByMetric = validStats.length
    ? {
        confidence: Math.round(validStats.reduce((acc, stats) => acc + stats.confidence, 0) / validStats.length),
        knowledge: Math.round(validStats.reduce((acc, stats) => acc + stats.knowledgeLevel, 0) / validStats.length),
        relevance: Math.round(validStats.reduce((acc, stats) => acc + stats.relevance, 0) / validStats.length),
        fluency: Math.round(validStats.reduce((acc, stats) => acc + stats.fluency, 0) / validStats.length),
        clarity: Math.round(validStats.reduce((acc, stats) => acc + stats.clarity, 0) / validStats.length),
      }
    : null;

  const overallScore =
    typeof session?.overallScore === 'number'
      ? session.overallScore
      : averageByMetric
      ? Math.round(
          (averageByMetric.confidence +
            averageByMetric.knowledge +
            averageByMetric.relevance +
            averageByMetric.fluency +
            averageByMetric.clarity) /
            5
        )
      : 0;

  const metrics = averageByMetric
    ? `Overall score ${overallScore}/100 across ${questions.length} questions.`
    : 'Interview completed, but evaluation metrics are not available yet.';

  const downloadTranscriptPdf = () => {
    const rows = (questions || []).map((q, idx) => `
      <div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
        <p><strong>Q${idx + 1}:</strong> ${q.text || ""}</p>
        <p><strong>Answer:</strong> ${q.answerText || "No answer provided."}</p>
        <p><strong>Feedback:</strong> ${q.feedback || "N/A"}</p>
      </div>
    `).join("");
    const html = `
      <html><head><title>Intervue Transcript</title></head>
      <body style="font-family:Arial,sans-serif;padding:24px;">
        <h1>Intervue Session Transcript</h1>
        <p><strong>Session:</strong> ${session?.title || "Session"}</p>
        <p><strong>Overall Score:</strong> ${overallScore}/100</p>
        ${rows}
      </body></html>
    `;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };
  
  return (
    <section aria-label="Completed Interview Session" className="max-w-4xl mx-auto mt-8">
      <div className="bg-[#1C1C1E] border border-[#A3E635]/30 rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <CheckCircle weight="fill" className="w-8 h-8 text-[#A3E635]" />
          <h2 className="text-2xl font-bold text-white">Session Completed: {session?.title ?? 'Untitled'}</h2>
        </div>
        <button
          onClick={downloadTranscriptPdf}
          className="mb-4 px-4 py-2 rounded-lg bg-[#A3E635] text-black text-sm font-semibold hover:bg-[#94d82d]"
        >
          Download Transcript (PDF)
        </button>
        
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ChartLineUp weight="bold" className="text-white/50 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Session Metrics</h3>
          </div>
          <p className="text-white/70">{metrics}</p>
          {averageByMetric && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {[
                ['Confidence', averageByMetric.confidence],
                ['Knowledge', averageByMetric.knowledge],
                ['Relevance', averageByMetric.relevance],
                ['Fluency', averageByMetric.fluency],
                ['Clarity', averageByMetric.clarity],
              ].map(([label, value]) => (
                <div key={label} className="bg-black/20 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-white/50 uppercase">{label}</p>
                  <p className="text-sm font-bold text-[#A3E635]">{value}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8" aria-label="Questions and Answers">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChatCircleText weight="fill" className="text-[#A3E635]" /> Questions & Answers
            </h3>
            
            {questions.length === 0 ? (
              <p className="text-white/50 text-center py-8">No per-question details available.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((it, idx) => (
                  <details key={it.id || idx} className="border border-white/10 rounded-xl bg-white/[0.02] group overflow-hidden">
                    <summary className="list-none cursor-pointer flex items-start gap-4 p-4 md:p-5 hover:bg-white/[0.03] transition-colors">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635]"
                        aria-hidden
                      >
                        <CaretDown className="h-7 w-7 group-open:rotate-180 transition-transform duration-200" weight="bold" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-2">
                          Question {idx + 1}
                        </span>
                        <p className="text-white text-base md:text-lg font-medium leading-snug">{it.text || "Question"}</p>
                        <span className="inline-block mt-2 text-[11px] font-semibold text-[#A3E635]/80 uppercase tracking-wider">
                          Tap to expand answer & feedback
                        </span>
                      </div>
                    </summary>
                    <div className="px-4 md:px-5 pb-5 pt-0 border-t border-white/5 bg-black/20">
                      <div className="bg-white/5 rounded-xl p-4">
                        <span className="text-[#A3E635]/60 text-xs font-bold uppercase tracking-widest block mb-2">Your Answer</span>
                        <p className="text-white/80">{it.answerText || 'No answer provided.'}</p>
                      </div>
                      {it.feedback && (
                        <div className="bg-[#A3E635]/5 border border-[#A3E635]/10 rounded-xl p-4 mt-3">
                          <span className="text-[#A3E635] text-xs font-bold uppercase tracking-widest block mb-2">
                            AI Feedback
                          </span>
                          <p className="text-white/80 text-sm leading-relaxed">{it.feedback}</p>
                        </div>
                      )}
                      {it.strongerAnswerSuggestion && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-3">
                          <span className="text-blue-300 text-xs font-bold uppercase tracking-widest block mb-2">
                            Stronger Answer Suggestion
                          </span>
                          <p className="text-white/80 text-sm leading-relaxed">{it.strongerAnswerSuggestion}</p>
                        </div>
                      )}
                      {it.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                          {Object.entries(it.stats).map(([metric, value]) => {
                            if (typeof value !== 'number') return null;
                            const label = metric === 'knowledgeLevel' ? 'Knowledge' : metric.charAt(0).toUpperCase() + metric.slice(1);
                            return (
                              <div key={metric} className="bg-black/20 rounded p-2 text-center">
                                <div className="text-[10px] text-white/50 uppercase mb-1">{label}</div>
                                <div className="text-sm font-bold text-[#A3E635]">{value}%</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {typeof scoreFromStats(it.stats) === "number" && (
                        <p className="text-xs text-white/50 mt-2">
                          Question score: {scoreFromStats(it.stats)}/100
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 sticky top-6" aria-label="AI Remarks">
            <h3 className="text-lg font-bold text-white mb-4">AI Remarks</h3>
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <p className="text-white/80 leading-relaxed text-sm">
                {averageByMetric
                  ? `Strongest area: ${Object.entries(averageByMetric).sort((a, b) => b[1] - a[1])[0][0]}. Focus next on ${
                      Object.entries(averageByMetric).sort((a, b) => a[1] - b[1])[0][0]
                    } to improve overall consistency.`
                  : 'No AI remarks available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
