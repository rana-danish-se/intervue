"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";

/**
 * Statuses:
 *  idle        — waiting for user to click Start
 *  loading     — fetching questions from server
 *  speaking    — AI TTS is reading the question aloud
 *  listening   — mic is active, capturing user answer
 *  done        — session completed/abandoned
 */
export function useInterviewRoom(sessionId, interviewId) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  // ── Core State ──────────────────────────────────────────────────────────────
  const [status, setStatus] = useState("idle");      // idle | loading | speaking | listening | done
  const [questions, setQuestions] = useState([]);    // [{ _id, questionText }]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);        // parallel array — answer per question index
  const [liveTranscript, setLiveTranscript] = useState("");   // live interim text
  const [finalTranscript, setFinalTranscript] = useState(""); // confirmed final text
  const [transcriptHistory, setTranscriptHistory] = useState([]); // [{ role: 'ai' | 'user', text, timestamp }]
  const [timer, setTimer] = useState(0); // seconds

  // ── Refs (stable across renders) ────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentIndexRef = useRef(0); 
  const isListeningRef = useRef(false);   
  const timerIntervalRef = useRef(null);

  // ── Timer Effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "idle" && status !== "loading" && status !== "done" && !timerIntervalRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    if (status === "done") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // ── Transcript Helpers ──────────────────────────────────────────────────────
  const addToHistory = useCallback((role, text) => {
    if (!text?.trim()) return;
    setTranscriptHistory((prev) => [
      ...prev,
      { 
        role, 
        text: text.trim(), 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  // ── Speech Synthesis (AI voice) ─────────────────────────────────────────────
  const speakText = useCallback((text, onDone) => {
    if (!window.speechSynthesis) {
      onDone?.();
      return;
    }

    window.speechSynthesis.cancel();
    addToHistory("ai", text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (preferred) utterance.voice = preferred;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices, { once: true });
    }

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => {
      onDone?.();
    };
    utterance.onerror = (e) => {
      console.warn("TTS error:", e.error);
      onDone?.();
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [addToHistory]);

  // ── Speech Recognition (User mic) ───────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", "error");
      return;
    }

    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setStatus("listening");
      setLiveTranscript("");
      setFinalTranscript("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setFinalTranscript((prev) => prev + final);
      }
      setLiveTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.error("Speech Recognition Error:", event.error);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch (_) {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e.message);
    }
  }, [showToast]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await sessionService.startAndFetchQuestions(sessionId);
      const qs = data.questions || [];

      if (qs.length === 0) {
        showToast("No questions were generated. Please try again.", "error");
        setStatus("idle");
        return;
      }

      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));
      setCurrentIndex(0);

      speakText(qs[0].questionText, () => {
        startListening();
      });
    } catch (err) {
      console.error("Failed to start interview:", err);
      showToast("Failed to load questions. Please try again.", "error");
      setStatus("idle");
    }
  }, [sessionId, speakText, startListening, showToast]);

  const nextQuestion = useCallback(() => {
    const idx = currentIndexRef.current;
    const fullAnswer = finalTranscript + liveTranscript;
    
    addToHistory("user", fullAnswer);

    setAnswers((prev) => {
      const updated = [...prev];
      updated[idx] = (updated[idx] || "") + fullAnswer.trim();
      return updated;
    });

    stopListening();
    window.speechSynthesis?.cancel();

    const nextIdx = idx + 1;
    setCurrentIndex(nextIdx);
    setLiveTranscript("");
    setFinalTranscript("");

    speakText(questions[nextIdx].questionText, () => {
      startListening();
    });
  }, [questions, finalTranscript, liveTranscript, stopListening, speakText, startListening, addToHistory]);

  const repeatQuestion = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    setLiveTranscript("");
    setFinalTranscript("");

    const q = questions[currentIndexRef.current];
    if (q) {
      speakText(q.questionText, () => {
        startListening();
      });
    }
  }, [questions, stopListening, speakText, startListening]);

  const abandonSession = useCallback(async () => {
    stopListening();
    window.speechSynthesis?.cancel();
    setStatus("done");

    try {
      await sessionService.abandonSession(sessionId);
      showToast("Session abandoned.", "info");
    } catch (err) {
      console.error("Failed to abandon session:", err);
    }

    router.push(`/dashboard/interviews/${interviewId}/session/${sessionId}`);
  }, [sessionId, interviewId, stopListening, router, showToast]);

  const endSession = useCallback(async () => {
    const idx = currentIndexRef.current;
    const fullAnswer = finalTranscript + liveTranscript;
    addToHistory("user", fullAnswer);

    const finalAnswers = [...answers];
    finalAnswers[idx] = (finalAnswers[idx] || "") + fullAnswer.trim();

    stopListening();
    window.speechSynthesis?.cancel();
    setStatus("done");

    try {
      const answersPayload = questions.map((q, i) => ({
        questionId: q._id,
        answerText: finalAnswers[i] || "",
      }));

      await sessionService.completeSession(sessionId, answersPayload);
      showToast("Interview completed! Your report is being generated.", "success");
    } catch (err) {
      console.error("Failed to complete session:", err);
      showToast("Failed to save answers. Please try again.", "error");
      setStatus("listening");
      return;
    }

    router.push(`/dashboard/interviews/${interviewId}/session/${sessionId}`);
  }, [sessionId, interviewId, questions, answers, finalTranscript, liveTranscript, stopListening, router, showToast, addToHistory]);

  useEffect(() => {
    return () => {
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stopListening]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const isAiSpeaking = status === "speaking";
  const isListening = status === "listening";
  const currentAnswerText = (answers[currentIndex] || "") + finalTranscript;

  return {
    status,
    questions,
    currentQuestion,
    currentIndex,
    isLastQuestion,
    isAiSpeaking,
    isListening,
    liveTranscript,
    finalTranscript,
    transcriptHistory,
    timer,
    currentAnswerText,
    startInterview,
    nextQuestion,
    repeatQuestion,
    abandonSession,
    endSession,
  };
}
