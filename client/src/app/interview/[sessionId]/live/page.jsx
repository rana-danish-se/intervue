"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Microphone, StopCircle, ArrowRight, CheckCircle, WarningCircle, CircleNotch, Play } from '@phosphor-icons/react';

export default function LiveInterview() {
  const router = useRouter();
  const { sessionId } = useParams();
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

  // Refs for speech and timers
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const synthRef = useRef(null);
  const timerRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Fetch session and questions
  useEffect(() => {
    if (!mounted) return;
    let isMounted = true;
    async function fetchQuestions() {
      try {
        const { default: axiosInstance } = await import('@/lib/axiosInstance');
        const res = await axiosInstance.get(`/sessions/${sessionId}`);
        if (isMounted) {
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
    fetchQuestions();
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
      // If we are supposed to be listening but it ended (e.g. timeout), we could try to restart
      // For now, just sync state
      setIsListening(false);
    };
    
    rec.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

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
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const q = questions[idx].text;
    const utter = new SpeechSynthesisUtterance(q);
    utter.rate = 0.95; // Slightly slower for better comprehension
    
    utter.onend = () => {
      // Automatically start listening after question is read
      startRecognition();
    };
    
    synthRef.current.speak(utter);
  };

  const startRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
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
    stopRecognition();
    
    // Save answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = { 
      questionId: currentQuestion.id, 
      answerText: transcription.trim() || 'No answer provided.' 
    };
    setAnswers(updatedAnswers);
    
    // Reset state for next question
    finalTranscriptRef.current = '';
    setTranscription('');
    
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      speakQuestion(currentIndex + 1);
    }
  };

  const onRepeat = () => {
    if (currentQuestion) {
      stopRecognition();
      speakQuestion(currentIndex);
    }
  };

  const onFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    stopRecognition();
    if (synthRef.current) synthRef.current.cancel();
    
    // Ensure last answer is saved if they didn't hit next
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = { 
      questionId: currentQuestion?.id, 
      answerText: transcription.trim() || 'No answer provided.' 
    };
    
    try {
      const { default: axiosInstance } = await import('@/lib/axiosInstance');
      await axiosInstance.post(`/sessions/${sessionId}/evaluate`, { answers: updatedAnswers });
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

  // Format time (MM:SS)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CircleNotch weight="bold" className="w-8 h-8 text-[#A3E635] animate-spin mb-4" />
        <p className="text-white/50 animate-pulse">Initializing live room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center mt-12 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <WarningCircle weight="fill" className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-red-400/80 mb-6">{error}</p>
        <button onClick={() => router.back()} className="text-white/60 hover:text-white underline">Go Back</button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center mt-12 bg-white/5 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2">No Questions Found</h2>
        <p className="text-white/60 mb-6">This session has no questions. Please generate them first.</p>
        <button onClick={() => router.push(`/dashboard/sessions/${sessionId}`)} className="text-[#A3E635] underline">Return to Session</button>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto p-8 mt-12 text-center">
        <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-12 shadow-2xl">
          <div className="w-24 h-24 bg-[#A3E635]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Microphone weight="fill" className="w-12 h-12 text-[#A3E635]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Ready to Begin?</h1>
          <p className="text-white/60 mb-10 max-w-md mx-auto">
            Ensure your microphone is enabled. The AI will speak each question out loud, and your response will be transcribed in real-time.
          </p>
          <button 
            onClick={handleStartInterview}
            className="bg-[#A3E635] text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#86CB16] transition-transform hover:scale-105"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const progressPct = totalQuestions ? Math.round(((currentIndex) / totalQuestions) * 100) : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-white/50 text-sm font-semibold uppercase tracking-wider block mb-1">Time</span>
            <span className="text-white font-mono text-xl">{formatTime(elapsed)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Interview</h2>
            <p className="text-white/50 text-sm">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="text-white/40 hover:text-red-400 transition-colors text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-400/10"
        >
          Abandon Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Speaker & Question */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center justify-center min-h-[300px]">
            {/* Pulsing Speaker Animation */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              {/* Outer pulse */}
              {isListening && (
                <div className="absolute inset-0 bg-[#A3E635]/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
              )}
              {/* Inner circle */}
              <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500 ${isListening ? 'bg-[#A3E635]' : 'bg-white/10'}`}>
                {isListening ? (
                  <Microphone weight="fill" className="w-10 h-10 text-black" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                )}
              </div>
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">AI Interviewer</h3>
            <p className="text-[#A3E635] text-sm font-medium">
              {isListening ? 'Listening to you...' : 'Speaking...'}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-4">Current Question</span>
            <p className="text-white text-lg leading-relaxed">
              {currentQuestion?.text}
            </p>
            <button 
              onClick={onRepeat}
              className="mt-6 text-[#A3E635] text-sm font-medium hover:underline flex items-center gap-2"
            >
              <Play weight="fill" /> Repeat Question
            </button>
          </div>
        </div>

        {/* Right Column: Transcription & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 flex flex-col flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Your Response</span>
              {isListening && (
                <span className="flex items-center gap-2 text-xs font-semibold text-[#A3E635] bg-[#A3E635]/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse"></div>
                  Recording
                </span>
              )}
            </div>
            
            <div className="flex-1 bg-black/30 border border-white/5 rounded-xl p-6 overflow-y-auto mb-6">
              {transcription ? (
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{transcription}</p>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30 text-center">
                  <p>When you are ready, speak your answer.<br/>The transcription will appear here.</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex-1">
                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#A3E635] transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-sm font-medium w-12 text-right">{progressPct}%</span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-8">
                {isListening && (
                   <button 
                     onClick={stopRecognition}
                     className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
                   >
                     <StopCircle weight="fill" className="w-5 h-5" /> Pause
                   </button>
                )}

                {isLastQuestion ? (
                  <button 
                    onClick={onFinish}
                    disabled={finishing}
                    className="flex items-center gap-2 bg-[#A3E635] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#86CB16] transition-colors disabled:opacity-50"
                  >
                    {finishing ? (
                      <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle weight="fill" className="w-5 h-5" />
                    )}
                    {finishing ? 'Evaluating...' : 'Finish & Submit'}
                  </button>
                ) : (
                  <button 
                    onClick={onNext}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Next Question <ArrowRight weight="bold" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
