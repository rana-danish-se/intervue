"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  CircleNotch, 
  CaretRight, 
  Info, 
  Microphone, 
  Waves, 
  Sparkle, 
  Warning, 
  Check,
  ArrowRight
} from '@phosphor-icons/react';

export default function PendingSessionView({ session }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const { default: axiosInstance } = await import('@/lib/axiosInstance');
      await axiosInstance.post(`/sessions/${session.id}/generate-questions`);
      router.push(`/interview/${session.id}/live`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Breadcrumbs & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
          <span>Interviews</span>
          <CaretRight size={14} weight="bold" />
          <span>{session.role || 'Developer'}</span>
          <CaretRight size={14} weight="bold" />
          <span className="text-white/60">Session {session.order || 1}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full self-start">
          <div className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse"></div>
          <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Pending</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#A3E635]"></div>
        <div className="inline-block px-2 py-0.5 rounded bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635] text-[10px] font-bold tracking-tighter uppercase mb-4">
          Session {session.order || 1}
        </div>
        <h1 className="text-4xl  font-bold text-white mb-6 leading-tight tracking-tight">
          {session.title || 'Session Overview'}
        </h1>
        <p className="text-white/50 text-lg leading-relaxed max-w-3xl">
          Focusing on {session.focus?.toLowerCase() || 'core competencies'}, this session evaluates technical depth, 
          problem-solving strategies, and practical application scenarios.
        </p>
      </div>

      {/* How This Session Works */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-10">
          <Info size={24} className="text-white/40" weight="bold" />
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">How This Session Works</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
              <Microphone size={24} className="text-[#A3E635]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI asks a question</h3>
            <p className="text-sm text-white/30 leading-relaxed">
              The AI will read the prompt aloud using high-fidelity neural voices.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
              <Waves size={24} className="text-[#A3E635]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">You answer via voice</h3>
            <p className="text-sm text-white/30 leading-relaxed">
              Speak naturally as you would in a real interview environment.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
              <Sparkle size={24} className="text-[#A3E635]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Evaluation</h3>
            <p className="text-sm text-white/30 leading-relaxed">
              Your responses are analyzed for technical accuracy and delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-2">Total Questions</span>
          <span className="text-xl font-bold text-white">5 Questions</span>
        </div>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-2">Focus Area</span>
          <span className="text-xl font-bold text-white truncate block">{session.focus || 'General Expertise'}</span>
        </div>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-2">Session Order</span>
          <span className="text-xl font-bold text-white">{session.order || 1} of {session.sessionCount || 3}</span>
        </div>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
          <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-2">Estimated Duration</span>
          <span className="text-xl font-bold text-white">~15-25 minutes</span>
        </div>
      </div>

      {/* Checklist & Action */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8">
        <details className="group" open>
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-3">
              <Warning size={24} className="text-[#A3E635]" weight="bold" />
              <h2 className="text-xl font-bold text-white">Before You Begin</h2>
            </div>
            <div className="text-white/20 group-open:rotate-180 transition-transform">
              <CaretRight size={20} weight="bold" className="rotate-90" />
            </div>
          </summary>
          
          <div className="mt-8 space-y-4 pb-4">
            {[
              "Find a quiet place before starting the session",
              "Allow microphone access in your browser when prompted",
              "Speak clearly and take your time to formulate your thoughts",
              "You can ask the AI to repeat any question during the session",
              "Once abandoned, the session must be reconducted from the start"
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check size={10} className="text-white/20" weight="bold" />
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </details>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-10">
          <button 
            onClick={handleStart}
            disabled={isStarting}
            className="max-w-fit mx-auto w-full group flex items-center justify-center gap-3 bg-[#A3E635] text-black px-6 py-3 rounded-2xl font-bold hover:bg-[#86CB16] transition-all transform cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <CircleNotch weight="bold" className="w-6 h-6 animate-spin" />
                Generating Session Questions...
              </>
            ) : (
              <>
                <span className="text-xl">Start Session</span>
                <ArrowRight weight="bold" className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 mt-6 text-white/20 text-xs">
            <Sparkle size={12} weight="fill" />
            <span>Once started, your session will be tracked for your progress history.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
