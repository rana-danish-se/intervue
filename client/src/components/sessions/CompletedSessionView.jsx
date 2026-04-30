import React from 'react';
import { CheckCircle, ChatCircleText, ChartLineUp } from '@phosphor-icons/react';

export default function CompletedSessionView({ session }) {
  const report = session?.report || {};
  const metrics = report?.summary || 'Interview completed. See details below.';
  const perQ = report?.perQuestion || [];
  
  return (
    <section aria-label="Completed Interview Session" className="max-w-4xl mx-auto mt-8">
      <div className="bg-[#1C1C1E] border border-[#A3E635]/30 rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <CheckCircle weight="fill" className="w-8 h-8 text-[#A3E635]" />
          <h2 className="text-2xl font-bold text-white">Session Completed: {session?.title ?? 'Untitled'}</h2>
        </div>
        
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ChartLineUp weight="bold" className="text-white/50 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Session Metrics</h3>
          </div>
          <p className="text-white/70">{metrics}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8" aria-label="Questions and Answers">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChatCircleText weight="fill" className="text-[#A3E635]" /> Questions & Answers
            </h3>
            
            {perQ.length === 0 ? (
              <p className="text-white/50 text-center py-8">No per-question details available.</p>
            ) : (
              <div className="space-y-8">
                {perQ.map((it, idx) => (
                  <div key={it.questionId || idx} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="mb-4">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-2">Question {idx + 1}</span>
                      <p className="text-white text-lg">{it.questionText || 'Question'}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <span className="text-[#A3E635]/60 text-xs font-bold uppercase tracking-widest block mb-2">Your Answer</span>
                      <p className="text-white/80">{it.answerText || 'No answer provided.'}</p>
                    </div>
                  </div>
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
                {report?.feedback ?? 'No AI remarks available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
