"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, CircleNotch } from '@phosphor-icons/react';

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
      
      // Navigate to live room once questions are successfully generated
      router.push(`/interview/${session.id}/live`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsStarting(false);
    }
  };

  return (
    <section aria-label="Pending Interview Session" className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Session: {session?.title ?? 'Untitled'}</h2>
      
      <div className="space-y-8">
        <div className="bg-white/5 rounded-xl p-6" aria-label="Guidelines">
          <h3 className="text-lg font-semibold text-white mb-3">Guidelines</h3>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Review the job role and core competencies.</li>
            <li>Follow the set interview protocol and timing guidelines.</li>
            <li>Maintain a professional and calm interview pace.</li>
          </ul>
        </div>
        
        <div className="bg-white/5 rounded-xl p-6" aria-label="Protocols">
          <h3 className="text-lg font-semibold text-white mb-3">Protocols</h3>
          <p className="text-white/70">
            Questions will be generated on-the-fly based on the interview profile. You will be evaluated on clarity, reasoning, and domain knowledge.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button 
            onClick={handleStart}
            disabled={isStarting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#A3E635] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#86CB16] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Play weight="fill" className="w-5 h-5" />
                Start Interview
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
