import { useRouter } from 'next/navigation';
import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react';

export default function AbandonedSessionView({ session }) {
  const router = useRouter();
  
  const handleReconduct = async () => {
    // If the backend requires clearing questions, that could be done here.
    // For now, navigating to the live page restarts the flow since they didn't finish.
    router.push(`/interview/${session.id}/live`);
  };

  return (
    <section aria-label="Abandoned Interview Session" className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto mt-8 text-center">
      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <WarningCircle weight="fill" className="w-10 h-10 text-yellow-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Session Abandoned</h2>
      <h3 className="text-lg text-white/50 mb-6">{session?.title ?? 'Untitled'}</h3>
      
      <div className="bg-white/5 rounded-xl p-6 mb-8 text-left" aria-label="Abandonment Info">
        <p className="text-white/70">
          The interview session was not completed. Your progress was not submitted for evaluation. You can reconduct the session to start fresh from the beginning.
        </p>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={handleReconduct}
          aria-label="Reconduct Session" 
          className="flex items-center gap-2 bg-[#A3E635] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#86CB16] transition-colors"
        >
          <ArrowClockwise weight="bold" className="w-5 h-5" />
          Reconduct Session
        </button>
      </div>
    </section>
  );
}
