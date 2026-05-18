# Audio-to-Text Conversion & Answer Storage Flow

## Complete Flow Documentation

This document traces how audio is captured in the live interview, converted to text (both client-side and backend), stored in React state, and finally persisted to the database when the session ends.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Audio Capture (Client Side)](#2-audio-capture-client-side)
3. [Speech Recognition (Browser Web Speech API)](#3-speech-recognition-browser-web-speech-api)
4. [Dual-Track: Browser Recognition + Backend Whisper](#4-dual-track-browser-recognition--backend-whisper)
5. [Answer Storage in Client State](#5-answer-storage-in-client-state)
6. [Answer Submission to Backend](#6-answer-submission-to-backend)
7. [Backend Answer Processing](#7-backend-answer-processing)
8. [Database Persistence](#8-database-persistence)

---

## 1. Overview

The interview system uses a **dual transcription approach**:
1. **Primary**: Browser's Web Speech API (SpeechRecognition) — real-time, no network needed
2. **Fallback**: Backend Groq Whisper API — more accurate, used as backup or for final capture

This ensures reliable transcription even if browser speech fails or user wants higher accuracy.

---

## 2. Audio Capture (Client Side)

### File: `src/hooks/useInterviewRoom.js`

#### MediaRecorder Setup

When the user starts answering in voice mode, the hook initializes audio capture:

```javascript
// Inside startListening() function (lines 296-315)
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio chunks as they're available
      mediaRecorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      // Start recording, collect chunks every 800ms
      mediaRecorder.start(800);
    })
    .catch(err => {
      console.error("Microphone access denied or error:", err);
    });
}
```

**What happens:**
- `navigator.mediaDevices.getUserMedia({ audio: true })` requests microphone access
- Creates a `MediaRecorder` instance connected to the microphone stream
- Audio is captured in chunks every 800ms (configurable interval)
- Chunks are stored in `audioChunksRef.current` array

#### Refs Used
| Ref | Purpose |
|-----|----------|
| `mediaRecorderRef` | Holds the MediaRecorder instance |
| `audioChunksRef` | Array storing audio chunks as Blob objects |
| `captureVersionRef` | Version counter to handle async race conditions |

---

## 3. Speech Recognition (Browser Web Speech API)

### File: `src/hooks/useInterviewRoom.js`

The hook also uses the browser's native Speech Recognition API for real-time transcription:

```javascript
// Inside startListening() function (lines 208-294)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;       // Don't stop after single phrase
recognition.interimResults = true;  // Show results while speaking
recognition.lang = getPreferredSttLang(); // e.g., "en-US"
recognition.maxAlternatives = 3;    // Multiple interpretations

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      // Final result - add to accumulated
      accumulatedFinalRef.current += `${transcript} `;
    } else {
      // Interim result - show live
      liveTranscriptRef.current = transcript;
      setLiveTranscript(interim); // Updates UI in real-time
    }
  }
};

recognition.onend = () => {
  // Auto-restart if still listening (continuous mode workaround)
  if (isListeningRef.current) {
    recognition.start();
  }
};

recognition.start();
```

**How it works:**
- `interimResults: true` provides real-time transcription as user speaks
- `isFinal: true` marks complete phrases, added to `accumulatedFinalRef`
- Interim results shown live in the UI (`liveTranscript` state)
- Automatic restart on end to maintain continuous listening

#### Refs Used
| Ref | Purpose |
|-----|----------|
| `recognitionRef` | Holds the SpeechRecognition instance |
| `accumulatedFinalRef` | Accumulates final transcripts across restarts |
| `liveTranscriptRef` | Holds current interim transcript for UI |
| `recognitionSessionRef` | Session token to prevent stale callbacks |

---

## 4. Dual-Track: Browser Recognition + Backend Whisper

### Why Dual-Track?

The browser's Speech Recognition can fail due to:
- Browser incompatibility (Safari vs Chrome vs Firefox)
- HTTPS/localhost requirements
- Network issues
- Accidental stopping

Therefore, the MediaRecorder captures raw audio throughout, which can be sent to the backend for Whisper transcription as a reliable fallback.

### When Backend Transcription is Used

**File: `src/hooks/useInterviewRoom.js` — `finalizeCurrentAnswer()` function (lines 375-394):**

```javascript
const finalizeCurrentAnswer = useCallback(async () => {
  let fullAnswer = "";
  
  // Primary: Use browser's accumulated transcript
  const voice = (accumulatedFinalRef.current + liveTranscriptRef.current).trim();
  
  // If voice input exists, also capture MediaRecorder audio as backup
  if (inputModeRef.current === "voice") {
    try {
      const audioBlob = await captureAudioBlob();
      if (audioBlob) {
        // Send to backend for Whisper transcription
        const text = await sessionService.transcribeAudio(audioBlob);
        fullAnswer = normalizeTranscript(text);
      }
    } catch (e) {
      console.error("Whisper Transcription Error:", e);
    }
  }
  
  // Combine with typed answer if exists
  const typed = normalizeTranscript(typedAnswerRef.current || "");
  
  // Priority: Whisper > Browser Voice > Typed
  if (fullAnswer && typed) return `${fullAnswer}\n\n${typed}`.trim();
  if (fullAnswer) return fullAnswer;
  if (typed) return typed;
  return captureCurrentAnswer(); // Fallback to browser transcript
}, [...]);
```

**Flow:**
1. Gets browser's accumulated transcript (`accumulatedFinalRef + liveTranscriptRef`)
2. Also captures MediaRecorder blob and sends to backend for Whisper
3. Uses Whisper text as primary if available
4. Falls back to browser transcript if Whisper fails
5. Appends typed answer if user also typed

### Client-Side Audio Capture for Backend

**`captureAudioBlob()` function (lines 353-373):**

```javascript
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
      
      // Create blob from collected chunks
      const blob = new Blob(chunksSnapshot, { type: 'audio/webm' });
      
      // Stop all tracks in the stream
      try { mr.stream.getTracks().forEach(track => track.stop()); } catch (_) {}
      
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      resolve(blob.size > 0 ? blob : null);
    };
    
    mr.addEventListener("stop", onStop, { once: true });
    mr.stop();
  });
}, []);
```

---

## 5. Answer Storage in Client State

### File: `src/hooks/useInterviewRoom.js`

#### State Variables

```javascript
const [answers, setAnswers] = useState([]);  // Array of answer strings
const answersRef = useRef([]);               // Synced ref for async access
```

#### How Answers are Stored

**1. During `nextQuestion()` (lines 429-470):**

```javascript
const nextQuestion = useCallback(async () => {
  const idx = currentIndexRef.current;
  
  setStatus("transcribing");
  stopListening();
  
  // Finalize answer (combine voice + typed)
  const fullAnswer = await finalizeCurrentAnswer();
  
  // Check if skipped
  const isSkipped = !fullAnswer || !fullAnswer.trim();
  if (isSkipped) {
    addToHistory("user", "[Skipped]");
  } else {
    addToHistory("user", fullAnswer);
  }
  
  // Store answer in state
  setAnswers((prev) => {
    const updated = [...prev];
    updated[idx] = fullAnswer;
    answersRef.current = updated;
    return updated;
  });
  
  // Move to next question
  const nextIdx = idx + 1;
  setCurrentIndex(nextIdx);
  // ... speak next question
}, [...]);
```

**2. During `endSession()` (lines 504-548):**

```javascript
const endSession = useCallback(async () => {
  const idx = currentIndexRef.current;
  
  // Finalize last answer
  const fullAnswer = await finalizeCurrentAnswer();
  
  // Store in local array (not setAnswers - going directly to payload)
  const base = [...answersRef.current];
  base[idx] = fullAnswer;
  
  // Create payload for backend
  const answersPayload = questions.map((q, i) => ({
    questionId: q._id,
    answerText: base[i] || "",
  }));
  
  // Submit to backend
  await sessionService.completeSession(sessionId, answersPayload);
  // ...
}, [...]);
```

#### Answer State Flow

```
User speaks/types answer
       ↓
finalizeCurrentAnswer() combines:
  - Whisper transcript (if voice mode)
  - Browser SpeechRecognition transcript (fallback)
  - Typed answer (if any)
       ↓
Answer stored in:
  - answers[] state (for current session)
  - answersRef.current (for async access)
       ↓
On nextQuestion/endSession:
  - Answers sent to backend as [{ questionId, answerText }, ...]
```

---

## 6. Answer Submission to Backend

### File: `src/services/session.service.js`

```javascript
completeSession: async (sessionId, answers) => {
  const response = await axiosInstance.post(
    `/sessions/${sessionId}/complete`,
    { answers }
  );
  return response.data;
}
```

### Request Payload Format

```json
{
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439011",
      "answerText": "I have 5 years of experience in React..."
    },
    {
      "questionId": "507f1f77bcf86cd799439012",
      "answerText": "My approach to testing involves..."
    }
  ]
}
```

### API Endpoint

| Method | Endpoint | Controller Function |
|--------|----------|---------------------|
| POST | `/api/sessions/:id/complete` | `session.controller.js` → `completeSession` |

---

## 7. Backend Answer Processing

### File: `src/controllers/session.controller.js`

#### `completeSession` handler (lines 192-265):

```javascript
export const completeSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { answers } = req.body; // [{ questionId, answerText }]
  const userId = req.user._id;

  const { session, interview } = await getAuthorizedSessionAndInterview(id, userId);

  // 1. Save all answers to session questions
  if (answers && answers.length > 0) {
    answers.forEach(({ questionId, answerText }) => {
      const question = session.questions.id(questionId);
      if (question) {
        question.userResponseText = answerText;
      }
    });
  }

  // 2. Set status to processing (client shows loading)
  session.status = 'processing';
  await session.save();

  // 3. Trigger async evaluation in background
  (async () => {
    try {
      for (const question of session.questions) {
        // Skip empty answers
        if (!question.userResponseText?.trim()) {
          question.stats = { confidence: 0, knowledgeLevel: 0, relevance: 0, fluency: 0, clarity: 0 };
          question.feedback = "This question was skipped. No answer was provided.";
          continue;
        }

        // Call LLM to evaluate answer
        const evaluation = await llmService.evaluateAnswer({
          role: interview.role,
          experienceLevel: interview.experienceLevel,
          question: question.questionText,
          answer: question.userResponseText
        });

        // Map evaluation results to question fields
        question.stats = { ... };
        question.feedback = evaluation.feedback;
        question.strongerAnswerSuggestion = evaluation.strongerAnswerSuggestion;
      }

      session.status = 'completed';
      await session.save();
    } catch (err) {
      // If evaluation fails, still mark as completed to avoid stuck state
      session.status = 'completed';
      await session.save();
    }
  })();

  res.status(200).json({
    success: true,
    message: 'Session is being evaluated'
  });
});
```

#### What Happens:

1. **Validate & Authorize**: Get session and ensure user owns it
2. **Save Answers**: Map `answerText` to each question's `userResponseText` field
3. **Set Processing Status**: Change session status to `'processing'`
4. **Async Evaluation**: Spawn background process to:
   - Call LLM for each question's answer
   - Generate scores (confidence, knowledge, relevance, fluency, clarity)
   - Generate feedback and stronger answer suggestions
   - Mark session as `'completed'` when done

---

## 8. Database Persistence

### File: `src/models/Question.model.js`

```javascript
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  
  // User's answer (audio transcript)
  userResponseText: {
    type: String,
    default: null,
  },
  
  // Optional: URL to stored audio (if saving audio files)
  audioUrl: {
    type: String,
    default: null,
  },
  userResponseAudioUrl: {
    type: String,
    default: null,
  },
  
  // Evaluation scores (filled after completion)
  stats: {
    confidence: { type: Number, min: 0, max: 100, default: null },
    knowledgeLevel: { type: Number, min: 0, max: 100, default: null },
    relevance: { type: Number, min: 0, max: 100, default: null },
    fluency: { type: Number, min: 0, max: 100, default: null },
    clarity: { type: Number, min: 0, max: 100, default: null },
  },
  
  // AI feedback text
  feedback: {
    type: String,
    default: null,
  },
  
  // Suggested improved answer
  strongerAnswerSuggestion: {
    type: String,
    default: null,
  }
});
```

### Document Structure in MongoDB

After session completion, a Session document looks like:

```javascript
{
  "_id": ObjectId("..."),
  "interviewId": ObjectId("..."),
  "title": "Session 1: Technical Skills",
  "status": "completed",
  "questions": [
    {
      "_id": ObjectId("..."),
      "questionText": "Tell me about your experience with React hooks...",
      "userResponseText": "I've been using React hooks for about 3 years now. I started with useState and useEffect...",
      "stats": {
        "confidence": 75,
        "knowledgeLevel": 82,
        "relevance": 78,
        "fluency": 70,
        "clarity": 80
      },
      "feedback": "Good coverage of useState and useEffect. Consider mentioning custom hooks...",
      "strongerAnswerSuggestion": "You could strengthen your answer by providing a concrete example..."
    },
    // ... more questions
  ],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## Summary Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT SIDE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌─────────────────────┐    ┌───────────────────────┐  │
│  │ MediaRecorder│    │ Web Speech API      │    │ Typed Input           │  │
│  │ (Audio Chunks)│    │ (SpeechRecognition)│    │ (Text Area)           │  │
│  └──────┬───────┘    └──────────┬──────────┘    └───────────┬───────────┘  │
│         │                       │                             │              │
│         │                       │ Live Transcript             │              │
│         │                       │ (interimResults)           │              │
│         │                       └──────────┬──────────────────┘              │
│         │                                  │                                  │
│         ▼                                  ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ finalizeCurrentAnswer()                                            │    │
│  │ 1. Capture MediaRecorder blob                                      │    │
│  │ 2. Send to backend (Whisper) → text                               │    │
│  │ 3. Combine with browser transcript                                 │    │
│  │ 4. Append typed answer if exists                                   │    │
│  │ 5. Return fullAnswer string                                        │    │
│  └────────────────────────────┬───────────────────────────────────────┘    │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Client State: answers[]                                            │    │
│  │ - answersRef.current[idx] = fullAnswer                            │    │
│  │ - answers state updated via setAnswers()                           │    │
│  └────────────────────────────┬───────────────────────────────────────┘    │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                    POST /sessions/:id/complete
                    { answers: [{ questionId, answerText }, ...] }
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER SIDE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ session.controller.js → completeSession                            │    │
│  │ 1. Validate authorization                                          │    │
│  │ 2. Map answerText → question.userResponseText                     │    │
│  │ 3. Set status = 'processing'                                       │    │
│  │ 4. Save to MongoDB                                                 │    │
│  │ 5. Trigger async evaluation (LLM)                                 │    │
│  └────────────────────────────┬───────────────────────────────────────┘    │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Background Evaluation Loop                                         │    │
│  │ For each question:                                                 │    │
│  │   - If no answer: set stats=0, feedback="skipped"                │    │
│  │   - Else: call llmService.evaluateAnswer()                        │    │
│  │     → Returns { scores: {...}, feedback, strongerAnswerSuggestion}│    │
│  │   - Save stats, feedback, strongerAnswerSuggestion                │    │
│  │ After all: set status = 'completed'                                │    │
│  └────────────────────────────┬───────────────────────────────────────┘    │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONGODB COLLECTION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  sessions collection:                                                       │
│  {                                                                          │
│    _id: ObjectId,                                                           │
│    questions: [                                                             │
│      {                                                                     │
│        questionText: "...",                                                │
│        userResponseText: "User's transcribed answer...",                  │
│        stats: { confidence: 75, knowledgeLevel: 82, ... },                │
│        feedback: "Good answer. Consider...",                               │
│        strongerAnswerSuggestion: "A better answer would be..."           │
│      }                                                                     │
│    ]                                                                        │
│  }                                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Files Summary

| Layer | File | Purpose |
|-------|------|---------|
| **Client** | `useInterviewRoom.js` | Audio capture, speech recognition, state management |
| **Client** | `session.service.js` | API call to `/sessions/transcribe` and `/sessions/:id/complete` |
| **Server** | `routes/session.js` | Route definitions including `POST /transcribe` and `POST /:id/complete` |
| **Server** | `speech.controller.js` | Handles audio upload, validates MIME type, calls Whisper |
| **Server** | `llm.service.js` | `transcribeAudio()` uses Groq Whisper API |
| **Server** | `session.controller.js` | `completeSession` saves answers and triggers evaluation |
| **Database** | `Question.model.js` | Schema with `userResponseText`, `stats`, `feedback`, `strongerAnswerSuggestion` |

---

## Error Handling

1. **No audio provided**: Backend returns empty string (line 17 in speech.controller.js)
2. **Unsupported format**: Returns 400 error
3. **Whisper fails**: Client falls back to browser transcript
4. **Evaluation fails**: Session still marked 'completed' to prevent stuck state
5. **Save fails**: Client shows error toast, remains on interview page