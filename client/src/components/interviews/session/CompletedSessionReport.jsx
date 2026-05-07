"use client";

import { CheckCircle, Brain, Target, Lightning, SpeakerHigh } from "@phosphor-icons/react";
import { scoreFromStats, averageScoreFromQuestions } from "@/lib/metrics/sessionMetrics";

export default function CompletedSessionReport({ session, report }) {
  // Support either session-driven data or a report payload from the backend
  const questionsFromSession = session?.questions || [];
  const questionsFromReport = (report?.perQuestion || []) .map((rq, idx) => {
    return {
      _id: rq.questionId || idx,
      questionText: rq.questionText || rq.question || '',
      userResponseText: rq.answerText || rq.userResponseText || '',
      feedback: rq.feedback || '',
      stats: rq.stats || {},
    };
  });
  const questions = questionsFromReport.length > 0 ? questionsFromReport : questionsFromSession;
  
  // Calculate some basic stats
  const totalQuestions = questions.length;
  const averageScore = averageScoreFromQuestions(questions) ?? 0;
  const isExcellent = averageScore >= 80;

  return (
    <div className="mt-8 space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target weight="fill" className="w-16 h-16" />
          </div>
          <p className="text-sm font-semibold text-white/40 mb-2">Total Questions</p>
          <p className="text-3xl font-bold text-white">{totalQuestions}</p>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lightning weight="fill" className="w-16 h-16" />
          </div>
          <p className="text-sm font-semibold text-white/40 mb-2">Average Score</p>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-bold ${isExcellent ? 'text-[#A3E635]' : 'text-orange-400'}`}>
              {Math.round(averageScore)}
            </p>
            <span className="text-sm text-white/40 mb-1">/ 100</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center items-center text-center">
           <CheckCircle weight="fill" className="w-10 h-10 text-[#A3E635] mb-2" />
           <p className="text-sm font-bold text-white">Session Completed</p>
           <p className="text-xs text-white/40">Evaluated by AI</p>
        </div>
      </div>

      {/* Detailed Q&A Breakdown */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Brain weight="fill" className="w-6 h-6 text-[#A3E635]" />
          <h3 className="text-xl font-bold text-white">Detailed Feedback</h3>
        </div>

        {questions.length === 0 ? (
          <p className="text-white/50 text-sm italic">No questions were recorded for this session.</p>
        ) : (
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q._id || idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 font-bold text-white/60 text-sm">
                    Q{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-2 leading-relaxed">
                      {q.questionText}
                    </h4>
                  </div>
                </div>

                <div className="pl-12 space-y-4">
                  {/* User Response */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <SpeakerHigh className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Your Response</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {q.userResponseText || <span className="italic text-white/30">No response recorded</span>}
                    </p>
                  </div>

                  {/* AI Feedback */}
                  {q.feedback && (
                    <div className="bg-[#A3E635]/5 border border-[#A3E635]/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[#A3E635]" />
                          <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider">AI Evaluation</span>
                        </div>
                        <span className="text-xs font-bold bg-[#A3E635]/20 text-[#A3E635] px-2 py-1 rounded">
                          Score: {scoreFromStats(q.stats) ?? 0}/100
                        </span>
                      </div>
                      
                      {q.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                          {Object.entries(q.stats).map(([key, value]) => {
                            if (key === '_id' || typeof value !== 'number') return null;
                            const label = key === 'knowledgeLevel' ? 'Knowledge' : key.charAt(0).toUpperCase() + key.slice(1);
                            return (
                              <div key={key} className="bg-black/20 rounded p-2 text-center">
                                <div className="text-[10px] text-white/50 uppercase mb-1">{label}</div>
                                <div className="text-sm font-bold text-[#A3E635]">{value}%</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-sm text-white/80 leading-relaxed">
                        {q.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
