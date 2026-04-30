"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Microphone, 
  ArrowRight, 
  ArrowClockwise, 
  CircleNotch, 
  WarningCircle, 
  User, 
  Timer,
  CheckCircle,
  XCircle,
  CaretRight
} from '@phosphor-icons/react';

export default function LiveInterview() {
  const router = useRouter();
  const { sessionId } = useParams();
  
  // State
  const [sessionData, setSessionData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [turn, setTurn] = useState('ai'); // 'ai' or 'user'
  const [conversation, setConversation] = useState([]); // [{ sender: 'ai' | 'user', text: string }]

  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const synthRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, transcription]);

  // Fetch session and questions
  useEffect(() => {
    if (!mounted) return;
    let isMounted = true;
    async function fetchSession() {
      try {
        const { default: axiosInstance } = await import('@/lib/axiosInstance');
        const res = await axiosInstance.get(`/sessions/${sessionId}`);
        if (isMounted) {
          setSessionData(res.data);
          setQuestions(res.data.questions || []);
          setAnswers((res.data.questions || []).map(q => ({ questionId: q.id, answerText: '' })));
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e.response?.data?.message || e.message);
          setLoading(false);
        }
      }
    }
    fetchSession();
    return () => { isMounted = false; };
  }, [sessionId, mounted]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser does not support speech recognition. Please use Chrome.");
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    
    rec.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscription(finalTranscriptRef.current + interimTranscript);
    };
    
    rec.onend = () => {
      // If we are still in 'user' turn and not finishing, restart if it stopped unexpectedly
      if (turn === 'user' && !finishing && isListening) {
        try { rec.start(); } catch(e) {}
      } else {
        setIsListening(false);
      }
    };
    
    rec.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      if (e.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
  }, [turn, finishing, isListening]);

  // Timer
  useEffect(() => {
    if (!startTime || finishing) return;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, finishing]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const speakQuestion = (idx) => {
    if (!questions[idx] || !synthRef.current) return;
    
    setTurn('ai');
    synthRef.current.cancel();
    
    const qText = questions[idx].text;
    const utter = new SpeechSynthesisUtterance(qText);
    utter.rate = 0.95;
    
    // Add to conversation history
    setConversation(prev => [...prev, { sender: 'ai', text: qText }]);
    
    utter.onend = () => {
      // Transition to user turn immediately after AI finishes
      setTurn('user');
      startRecognition();
    };
    
    synthRef.current.speak(utter);
  };

  const startRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
        finalTranscriptRef.current = '';
        setTranscription('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleStartInterview = () => {
    if (!questions.length) return;
    setHasStarted(true);
    setStartTime(Date.now());
    speakQuestion(0);
  };

  const onNext = () => {
    if (!currentQuestion) return;
    
    const finalAnswer = transcription.trim() || 'No answer provided.';
    
    // Add user response to conversation
    setConversation(prev => [...prev, { sender: 'user', text: finalAnswer }]);
    
    // Save answer for final submission
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = { 
      questionId: currentQuestion.id, 
      answerText: finalAnswer
    };
    setAnswers(updatedAnswers);
    
    stopRecognition();
    
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => speakQuestion(currentIndex + 1), 500);
    } else {
      onFinish(updatedAnswers);
    }
  };

  const onRepeat = () => {
    if (currentQuestion) {
      stopRecognition();
      // Remove last AI entry to avoid duplication in transcript if desired, 
      // but usually repeats are just spoken. Let's just speak it.
      speakQuestion(currentIndex);
    }
  };

  const onFinish = async (finalAnswersPayload = null) => {
    if (finishing) return;
    setFinishing(true);
    stopRecognition();
    if (synthRef.current) synthRef.current.cancel();
    
    const payload = finalAnswersPayload || answers;
    
    try {
      const { default: axiosInstance } = await import('@/lib/axiosInstance');
      await axiosInstance.post(`/sessions/${sessionId}/evaluate`, { answers: payload });
      router.push(`/dashboard/sessions/${sessionId}`);
    } catch (e) {
      console.error(e);
      setError("Failed to submit session. " + (e.response?.data?.message || e.message));
      setFinishing(false);
    }
  };

  const onExit = async () => {
    stopRecognition();
    if (synthRef.current) synthRef.current.cancel();
    
    try {
      const { default: axiosInstance } = await import('@/lib/axiosInstance');
      await axiosInstance.patch(`/sessions/${sessionId}/abandon`);
    } catch (e) {
      console.error("Failed to abandon session", e);
    }
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <CircleNotch weight="bold" className="w-10 h-10 text-[#A3E635] animate-spin mb-4" />
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Initializing Secure Environment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black px-6">
        <div className="max-w-md w-full bg-[#1C1C1E] border border-red-500/20 rounded-3xl p-10 text-center">
          <WarningCircle weight="fill" className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">System Error</h2>
          <p className="text-white/50 mb-8 leading-relaxed">{error}</p>
          <button onClick={() => router.back()} className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-white/10">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#1C1C1E] border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3E635] to-transparent opacity-50"></div>
          
          <div className="w-24 h-24 bg-[#A3E635]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#A3E635]/20 rotate-3">
            <Microphone weight="fill" className="w-12 h-12 text-[#A3E635] -rotate-3" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready for your interview?</h1>
          <p className="text-white/50 text-lg mb-12 max-w-md mx-auto leading-relaxed">
            The AI is initialized and ready to evaluate your responses. Ensure you're in a quiet space with your microphone enabled.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleStartInterview}
              className="w-full sm:w-auto bg-[#A3E635] text-black px-12 py-5 rounded-2xl font-bold text-lg hover:bg-[#86CB16] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#A3E635]/10"
            >
              Enter Session
            </button>
            <button 
              onClick={onExit}
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white/40 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Timer size={20} className="text-[#A3E635]" weight="bold" />
            <span className="font-mono text-lg font-medium tabular-nums">{formatTime(elapsed)}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div>
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">{sessionData?.title || 'Live Interview'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#A3E635] text-xs font-bold uppercase tracking-tighter">Live Session</span>
              <div className="w-1 h-1 rounded-full bg-[#A3E635] animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < currentIndex ? 'w-4 bg-[#A3E635]' : 
                    i === currentIndex ? 'w-8 bg-[#A3E635] ring-4 ring-[#A3E635]/20' : 
                    'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Question {currentIndex + 1} of {totalQuestions}</span>
          </div>
          <button 
            onClick={onExit}
            className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <XCircle size={18} weight="bold" />
            End Interview
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Main Experience */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
          {/* Avatar Area */}
          <div className="relative mb-12">
            {/* Glow Effect */}
            <div className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-1000 opacity-20 ${turn === 'ai' ? 'bg-[#A3E635]' : 'bg-blue-500'}`}></div>
            
            <div className={`relative w-64 h-64 rounded-[3rem] p-1 border transition-all duration-700 overflow-hidden ${turn === 'ai' ? 'border-[#A3E635]/30' : 'border-white/10'}`}>
              <div className="w-full h-full rounded-[2.8rem] bg-[#1C1C1E] flex items-center justify-center overflow-hidden">
                {turn === 'ai' ? (
                  <img src="/avatar.png" alt="AI Avatar" className="w-full h-full object-cover scale-110" />
                ) : (
                  <div className="flex flex-col items-center">
                    <User size={80} weight="duotone" className="text-white/20 mb-2" />
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">You are speaking</span>
                  </div>
                )}
              </div>
              
              {/* Turn Indicator Dot */}
              <div className={`absolute bottom-6 right-6 w-4 h-4 rounded-full border-4 border-[#1C1C1E] z-20 ${turn === 'ai' ? 'bg-[#A3E635]' : 'bg-blue-500'}`}></div>
            </div>
          </div>

          {/* Current Question Text */}
          <div className="max-w-2xl text-center">
            <h3 className={`text-2xl sm:text-3xl font-medium leading-tight transition-all duration-700 ${turn === 'ai' ? 'text-white' : 'text-white/40'}`}>
              {currentQuestion?.text}
            </h3>
            {turn === 'user' && transcription && (
              <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl max-h-32 overflow-y-auto w-full">
                <p className="text-[#A3E635] text-lg font-medium italic">"{transcription}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Transcript Sidebar */}
        <aside className="w-[400px] border-l border-white/5 bg-[#0A0A0A] flex flex-col z-10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#A3E635]"></div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Transcript</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {conversation.map((entry, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${entry.sender === 'ai' ? 'text-[#A3E635]' : 'text-white/40'}`}>
                    {entry.sender === 'ai' ? 'The AI' : 'You'}
                  </span>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>
                <p className={`text-sm leading-relaxed ${entry.sender === 'ai' ? 'text-white/80' : 'text-white/60'}`}>
                  {entry.text}
                </p>
              </div>
            ))}
            
            {/* Current Real-time Transcript */}
            {turn === 'user' && transcription && (
              <div className="flex flex-col gap-3 opacity-60">
                 <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#A3E635]">Recording...</span>
                  <div className="flex-1 h-px bg-[#A3E635]/20"></div>
                </div>
                <p className="text-sm leading-relaxed text-[#A3E635] italic">
                  {transcription}
                </p>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </aside>
      </main>

      {/* Bottom Control Bar */}
      <footer className="h-32 border-t border-white/5 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-20">
        <div className="flex items-center gap-8">
          {/* Repeat Button */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={onRepeat}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group"
            >
              <ArrowClockwise size={24} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Repeat</span>
          </div>

          {/* Microphone Button */}
          <div className="relative">
            {isListening && (
              <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping"></div>
            )}
            <button 
              className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                isListening ? 'bg-red-500 text-white shadow-2xl shadow-red-500/40' : 'bg-[#1C1C1E] text-white/20 border border-white/10'
              }`}
            >
              <Microphone size={40} weight={isListening ? "fill" : "bold"} />
            </button>
          </div>

          {/* Next Button */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={onNext}
              disabled={turn === 'ai'}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#A3E635] hover:bg-[#A3E635] hover:text-black transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group"
            >
              <CaretRight size={28} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[10px] font-bold text-[#A3E635]/40 uppercase tracking-widest">Next</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
