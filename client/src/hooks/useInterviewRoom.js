"use client";

/*
Role: Interview room orchestration hook.
What it does: Coordinates question flow, speech synthesis/recognition, audio capture + transcription fallback, timer state, and submission actions.
Where used: Consumed by live interview route UIs to drive the complete session interaction loop.
Why it exists: Concentrates live interview behavior behind a single reusable stateful interface.
*/

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";
import {
  warmUpMicrophone,
  isSpeechRecognitionUsable,
  getPreferredSttLang,
} from "@/lib/speech/speechUtils";

const SETTINGS_KEY = "intervue-user-settings";

function loadPreferTypedFromStorage() {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed.preferTypedAnswers;
  } catch {
    return false;
  }
}

/**
 * Statuses:
 *  idle        — waiting for user to click Start
 *  loading     — fetching questions from server
 *  speaking    — AI TTS is reading the question aloud
 *  listening   — user's turn (voice and/or typed answer)
 *  done        — session completed/abandoned
 */
export function useInterviewRoom(sessionId) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [status, setStatus] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [typedAnswer, setTypedAnswerState] = useState("");
  const [inputMode, setInputMode] = useState("voice"); // "voice" | "type"
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [timer, setTimer] = useState(0);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isListeningRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const accumulatedFinalRef = useRef("");
  const liveTranscriptRef = useRef("");
  const typedAnswerRef = useRef("");
  const answersRef = useRef([]);
  const inputModeRef = useRef("voice");
  const speechToastShownRef = useRef(false);
  const submitLockRef = useRef(false);
  const recognitionSessionRef = useRef(0);
  const captureVersionRef = useRef(0);
  
  // Audio recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const setTypedAnswer = useCallback((value) => {
    setTypedAnswerState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      typedAnswerRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    inputModeRef.current = inputMode;
    if (inputMode === "type") {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }
      setLiveTranscript("");
      liveTranscriptRef.current = "";
    }
  }, [inputMode]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadPreferTypedFromStorage()) {
      setInputMode("type");
      inputModeRef.current = "type";
    }
  }, []);

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

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const addToHistory = useCallback((role, text) => {
    if (!text?.trim()) return;
    setTranscriptHistory((prev) => [
      ...prev,
      {
        role,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  const captureCurrentAnswer = useCallback(() => {
    const interim = liveTranscriptRef.current || "";
    const voice = (accumulatedFinalRef.current + interim).trim();
    const typed = (typedAnswerRef.current || "").trim();
    if (voice && typed) return `${voice}\n\n${typed}`.trim();
    return voice || typed;
  }, []);

  const normalizeTranscript = useCallback((value) => {
    return (value || "").replace(/\s+/g, " ").trim();
  }, []);

  const beginAnswerCapture = useCallback(() => {
    const wantVoice = inputModeRef.current === "voice";
    if (!wantVoice) {
      setStatus("listening");
      return;
    }
    startListeningRef.current();
  }, []);

  const startListeningRef = useRef(() => {});

  const speakText = useCallback(
    (text, onDone) => {
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
      utterance.onerror = () => {
        onDone?.();
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [addToHistory]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !isSpeechRecognitionUsable()) {
      setStatus("listening");
      return;
    }

    isListeningRef.current = false;
    accumulatedFinalRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    setLiveTranscript("");
    liveTranscriptRef.current = "";

    const lang = getPreferredSttLang();
    const sessionToken = Date.now();
    recognitionSessionRef.current = sessionToken;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      if (recognitionSessionRef.current !== sessionToken) return;
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedFinalRef.current += `${transcript} `;
          interim = "";
        } else {
          interim += transcript;
        }
      }

      liveTranscriptRef.current = interim;
      setLiveTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (recognitionSessionRef.current !== sessionToken) return;
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Speech recognition:", event.error);
      }
    };

    recognition.onend = () => {
      if (recognitionSessionRef.current !== sessionToken) return;
      if (isListeningRef.current) {
        try {
          const SpeechRecognition2 = window.SpeechRecognition || window.webkitSpeechRecognition;
          const r = new SpeechRecognition2();
          r.continuous = true;
          r.interimResults = true;
          r.lang = lang;
          r.maxAlternatives = 3;
          r.onstart = recognition.onstart;
          r.onresult = recognition.onresult;
          r.onerror = recognition.onerror;
          r.onend = recognition.onend;
          recognitionRef.current = r;
          r.start();
        } catch (_) {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e.message);
      setStatus("listening");
    }

    // Start robust audio recording for backend Whisper STT
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.addEventListener("dataavailable", event => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          });

          mediaRecorder.start(800);
        })
        .catch(err => {
          console.error("Microphone access denied or error:", err);
        });
    }

  }, []);

  startListeningRef.current = startListening;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (inputMode !== "voice") return;
    if (status !== "listening") return;
    if (recognitionRef.current || mediaRecorderRef.current) return;
    startListeningRef.current();
  }, [inputMode, status]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionSessionRef.current = 0;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (_) {}
      try {
        mediaRecorderRef.current.stream?.getTracks()?.forEach((track) => track.stop());
      } catch (_) {}
      mediaRecorderRef.current = null;
    }
    setLiveTranscript("");
    liveTranscriptRef.current = "";
  }, []);

  const captureAudioBlob = useCallback(() => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === "inactive") {
        resolve(null);
        return;
      }
      const version = ++captureVersionRef.current;
      const chunksSnapshot = [...audioChunksRef.current];
      const onStop = () => {
        if (version !== captureVersionRef.current) return;
        const blob = new Blob(chunksSnapshot, { type: 'audio/webm' });
        try { mr.stream.getTracks().forEach(track => track.stop()); } catch (_) {}
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        resolve(blob.size > 0 ? blob : null);
      };
      mr.addEventListener("stop", onStop, { once: true });
      mr.stop();
    });
  }, []);

  const finalizeCurrentAnswer = useCallback(async () => {
    let fullAnswer = "";
    if (inputModeRef.current === "voice") {
      try {
        const audioBlob = await captureAudioBlob();
        if (audioBlob) {
          const text = await sessionService.transcribeAudio(audioBlob);
          fullAnswer = normalizeTranscript(text);
        }
      } catch (e) {
        console.error("Whisper Transcription Error:", e);
      }
    }
    const typed = normalizeTranscript(typedAnswerRef.current || "");
    const fallback = normalizeTranscript(captureCurrentAnswer());
    if (fullAnswer && typed) return `${fullAnswer}\n\n${typed}`.trim();
    if (fullAnswer) return fullAnswer;
    if (typed) return typed;
    return fallback;
  }, [captureAudioBlob, captureCurrentAnswer, normalizeTranscript]);

  const startInterview = useCallback(async () => {
    setStatus("loading");
    speechToastShownRef.current = false;
    try {
      await warmUpMicrophone();

      const data = await sessionService.startAndFetchQuestions(sessionId);
      const qs = data.questions || [];

      if (qs.length === 0) {
        showToast("No questions were generated. Please try again.", "error");
        setStatus("idle");
        return;
      }

      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));
      answersRef.current = new Array(qs.length).fill("");
      setCurrentIndex(0);
      accumulatedFinalRef.current = "";
      typedAnswerRef.current = "";
      setTypedAnswerState("");

      speakText(qs[0].questionText, () => {
        beginAnswerCapture();
      });
    } catch (err) {
      console.error("Failed to start interview:", err);
      showToast("Failed to load questions. Please try again.", "error");
      setStatus("idle");
    }
  }, [sessionId, speakText, beginAnswerCapture, showToast]);

  const nextQuestion = useCallback(async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const idx = currentIndexRef.current;

      setStatus("transcribing");
      stopListening();
      window.speechSynthesis?.cancel();

      const fullAnswer = await finalizeCurrentAnswer();

    if (fullAnswer) {
      addToHistory("user", fullAnswer);
    }

    setAnswers((prev) => {
      const updated = [...prev];
      updated[idx] = fullAnswer;
      answersRef.current = updated;
      return updated;
    });

      typedAnswerRef.current = "";
      setTypedAnswerState("");

      const nextIdx = idx + 1;
      setCurrentIndex(nextIdx);
      accumulatedFinalRef.current = "";

      speakText(questions[nextIdx].questionText, () => {
        beginAnswerCapture();
      });
    } finally {
      submitLockRef.current = false;
    }
  }, [questions, stopListening, speakText, beginAnswerCapture, addToHistory, finalizeCurrentAnswer]);

  const repeatQuestion = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    accumulatedFinalRef.current = "";
    typedAnswerRef.current = "";
    setTypedAnswerState("");
    setLiveTranscript("");
    liveTranscriptRef.current = "";

    const q = questions[currentIndexRef.current];
    if (q) {
      speakText(q.questionText, () => {
        beginAnswerCapture();
      });
    }
  }, [questions, stopListening, speakText, beginAnswerCapture]);

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

    router.push(`/dashboard/sessions/${sessionId}`);
  }, [sessionId, stopListening, router, showToast]);

  const endSession = useCallback(async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const idx = currentIndexRef.current;

      setStatus("transcribing");
      stopListening();
      window.speechSynthesis?.cancel();

      const fullAnswer = await finalizeCurrentAnswer();

    if (fullAnswer) {
      addToHistory("user", fullAnswer);
    }

      const base = [...answersRef.current];
      base[idx] = fullAnswer;

      setStatus("done");

      try {
      const answersPayload = questions.map((q, i) => ({
        questionId: q._id,
        answerText: base[i] || "",
      }));

      await sessionService.completeSession(sessionId, answersPayload);
      showToast("Interview completed! Your report is being generated.", "success");
      } catch (err) {
        console.error("Failed to complete session:", err);
        showToast("Failed to save answers. Please try again.", "error");
        setStatus("listening");
        return;
      }

      router.push(`/dashboard/sessions/${sessionId}`);
    } finally {
      submitLockRef.current = false;
    }
  }, [sessionId, questions, stopListening, router, showToast, addToHistory, finalizeCurrentAnswer]);

  useEffect(() => {
    return () => {
      stopListening();
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        } catch (_) {}
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stopListening]);

  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const isAiSpeaking = status === "speaking";
  const isListening = status === "listening";
  const [speechUsable, setSpeechUsable] = useState(false);
  useEffect(() => {
    setSpeechUsable(isSpeechRecognitionUsable());
  }, []);

  return {
    status,
    questions,
    currentQuestion,
    currentIndex,
    isLastQuestion,
    isAiSpeaking,
    isListening,
    liveTranscript,
    typedAnswer,
    setTypedAnswer,
    inputMode,
    setInputMode,
    speechUsable,
    transcriptHistory,
    timer,
    startInterview,
    nextQuestion,
    repeatQuestion,
    abandonSession,
    endSession,
  };
}
