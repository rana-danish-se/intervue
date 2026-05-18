# Intervue Client-Side User Flow Documentation

## Overview

This document traces the complete user journey from interview creation through live interview conduction to final evaluation and results — from the frontend perspective. It identifies key client-side files, their responsibilities, and how they interact with the backend API.

---

## Table of Contents

1. [Interview Creation](#1-interview-creation)
2. [Interview List & Dashboard](#2-interview-list--dashboard)
3. [Session Detail & Question Generation](#3-session-detail--question-generation)
4. [Live Interview Room](#4-live-interview-room)
5. [Session Completion & Results](#5-session-completion--results)
6. [State Management](#6-state-management)

---

## 1. Interview Creation

### User Action
User fills out the Create Interview form with role, experience level, job description, goal, and session count.

### Frontend Files

#### File: `src/app/dashboard/interviews/create/page.jsx`
- **Purpose**: Form UI for creating a new interview
- **Logic**:
  - Maintains local form state (role, experienceLevel, jobDescription, goal, sessionCount)
  - Performs client-side validation before submission
  - Calls `interviewService.createInterview()` on form submit
  - On success: adds interview to global store, shows success toast, redirects to interview detail page
  - On error: shows error toast with message from server

#### File: `src/services/interview.service.js`
- **Purpose**: HTTP client for interview API endpoints
- **Key Function**:
  ```javascript
  createInterview: async (data) => {
    const response = await axiosInstance.post('/interviews', data);
    return response.data;
  }
  ```
- **Sends**: `{ role, experienceLevel, sessionCount, jobDescription?, goal? }`
- **Receives**: `{ success, interview, sessions }`

#### File: `src/store/interviewStore.js`
- **Purpose**: Global interview state management (Zustand)
- **Key Action**:
  - `addInterview(interview)`: Optimistically adds new interview to the list after creation

### Data Flow
```
User Form → create/page.jsx (validate)
         → interviewService.createInterview()
         → Backend: interview.controller.js → interview.service.js
         → Response → addInterview() → Redirect to interview detail
```

---

## 2. Interview List & Dashboard

### User Action
User views the dashboard with all interviews and aggregated statistics.

### Frontend Files

#### File: `src/app/dashboard/page.jsx`
- **Purpose**: Main dashboard showing stats, recent activity, and interviews
- **Logic**:
  - Uses `useDashboardSummary()` hook to fetch aggregated stats
  - Displays: Total Interviews, Sessions Completed, Average Score, Hiring Probability
  - Shows recent activity feed with session scores

#### File: `src/hooks/useDashboardSummary.js`
- **Purpose**: Fetches dashboard summary data on mount
- **Logic**:
  - Calls `interviewService.getDashboardSummary()`
  - Returns: `{ data, isLoading, error }`
- **API Call**: `GET /interviews/dashboard/summary`

#### File: `src/app/dashboard/interviews/page.jsx`
- **Purpose**: Lists all user interviews
- **Logic**:
  - Uses `useInterviews()` hook to fetch and cache interviews
  - Renders `InterviewCard` for each interview

#### File: `src/hooks/useInterviews.js`
- **Purpose**: Fetches user interviews and manages global interview state
- **Logic**:
  - Calls `interviewService.getInterviews()` on mount
  - Stores result in `interviewStore` via `setInterviews()`
  - Caches data to avoid re-fetching on page revisit
  - Shows toast on error

#### File: `src/services/interview.service.js`
- **Key Functions**:
  ```javascript
  getInterviews: async () => {
    const response = await axiosInstance.get('/interviews');
    return response.data; // { success, count, interviews }
  }
  
  getDashboardSummary: async () => {
    const response = await axiosInstance.get('/interviews/dashboard/summary');
    return response.data;
  }
  ```

#### File: `src/components/interviews/InterviewCard.jsx`
- **Purpose**: Card component displaying interview summary
- **Logic**:
  - Shows role, experience level, session count, average score
  - Smart button label based on `progressStatus`:
    - "View Results" for completed interviews
    - "Continue" for in-progress
    - "Begin" for pending

---

## 3. Session Detail & Question Generation

### User Action
User views a specific session and clicks "Start Session" to generate questions and begin the interview.

### Frontend Files

#### File: `src/app/dashboard/sessions/[sessionId]/page.jsx`
- **Purpose**: Session detail page — routes to status-specific views
- **Logic**:
  - Fetches session data on mount via direct axios call
  - Polls every 3 seconds if status is "processing" (waiting for evaluation)
  - Handles session status:
    - `pending`: Shows `PendingSessionView` component
    - `in-progress`: Shows "Continue Session" button to live room
    - `processing`: Shows loading spinner while AI evaluates
    - `completed`: Shows `CompletedSessionView` component
    - `abandoned`: Shows `AbandonedSessionView` component

#### File: `src/components/sessions/PendingSessionView.jsx`
- **Purpose**: UI for pending sessions before starting
- **Logic**:
  - Displays session title, description, difficulty/persona selectors
  - On "Start Session" click:
    1. Calls `axiosInstance.post('/sessions/{id}/generate-questions')` with difficulty/persona
    2. Sets `isStarting` state to show loading spinner
    3. On success: redirects to `/interview/{sessionId}/live`
    4. On error: shows error message

#### File: `src/services/session.service.js`
- **Key Function**:
  ```javascript
  startAndFetchQuestions: async (sessionId, options = {}) => {
    const response = await axiosInstance.post(
      `/sessions/${sessionId}/generate-questions`,
      options // { difficulty, interviewerPersona }
    );
    return response.data; // { success, questions: [{_id, questionText}] }
  }
  ```

### Data Flow
```
User clicks "Start Session"
  → session.service.startAndFetchQuestions(sessionId, { difficulty, persona })
  → Backend: session.controller.js → generateQuestions
  → LLM generates 5 questions → saved to session
  → Response: { success, questions: [...] }
  → Redirect to /interview/{sessionId}/live
```

---

## 4. Live Interview Room

### User Action
User goes through the live interview: listens to AI questions, answers via voice or typed input, advances through questions.

### Frontend Files

#### File: `src/app/interview/[sessionId]/live/page.jsx`
- **Purpose**: Main live interview interface
- **Logic**:
  - Uses `useInterviewRoom(sessionId)` hook for all interview logic
  - Renders:
    - Header with session title and timer
    - Sidebar with live transcript
    - Main area with question, input mode toggle, and answer input
    - Controls: repeat question, microphone, next/finish

#### File: `src/hooks/useInterviewRoom.js`
- **Purpose**: Core orchestration hook managing the entire live interview flow
- **Responsibilities**:

##### State Management
- `status`: "idle" | "loading" | "speaking" | "listening" | "transcribing" | "done"
- `questions`: Array of question objects
- `currentIndex`: Current question index
- `answers`: Array of user answers
- `transcriptHistory`: Array of { role, text, timestamp }
- `timer`: Interview duration in seconds
- `inputMode`: "voice" or "type"

##### Key Functions

**`startInterview()`**
- Calls `sessionService.startAndFetchQuestions(sessionId)`
- Sets questions array
- Initiates TTS to speak first question via `speakText()`
- Starts answer capture via `beginAnswerCapture()`

**`speakText(text, onDone)`**
- Uses Web Speech API (`window.speechSynthesis`)
- Selects English voice (prefers Google voices)
- Adds question text to transcript history
- Sets status to "speaking" during playback

**`startListening()`**
- Uses Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`)
- Handles continuous recognition for voice input
- Captures both interim and final results
- Also starts MediaRecorder for robust audio capture (sent to backend for Whisper transcription)
- Sets status to "listening"

**`stopListening()`**
- Stops speech recognition
- Stops media recorder and releases microphone
- Clears live transcript

**`finalizeCurrentAnswer()`**
- If voice mode: captures audio blob from MediaRecorder, sends to `sessionService.transcribeAudio()` for Whisper transcription
- Normalizes and combines with typed answer if both exist
- Returns full answer text

**`nextQuestion()`**
- Finalizes current answer via `finalizeCurrentAnswer()`
- Stores answer in answers array
- Advances to next question index
- Speaks next question via `speakText()`
- Begins answer capture

**`endSession()`**
- Finalizes last answer
- Prepares answers payload: `[{ questionId, answerText }, ...]`
- Calls `sessionService.completeSession(sessionId, answersPayload)`
- Shows success toast: "Interview completed! Your report is being generated."
- Redirects to session detail page

**`abandonSession()`**
- Calls `sessionService.abandonSession(sessionId)`
- Shows "Session abandoned" toast
- Redirects to session detail page

**`repeatQuestion()`**
- Re-speaks current question via `speakText()`

##### Audio Recording
- Uses `MediaRecorder` API to capture audio chunks
- On question transition: captures final blob and sends to backend for Whisper transcription
- Fallback: If browser speech recognition fails, uses backend transcription as primary

#### File: `src/services/session.service.js`
- **Key Functions**:
  ```javascript
  // Transcribe audio using Groq Whisper via backend
  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    const response = await axiosInstance.post('/sessions/transcribe', formData);
    return response.data.text;
  }

  // Complete session with all answers
  completeSession: async (sessionId, answers) => {
    const response = await axiosInstance.post(
      `/sessions/${sessionId}/complete`,
      { answers }
    );
    return response.data;
  }

  // Mark session as abandoned
  abandonSession: async (sessionId) => {
    const response = await axiosInstance.patch(`/sessions/${sessionId}/abandon`);
    return response.data;
  }
  ```

### Status Flow
```
idle → loading (fetching questions)
     → speaking (AI reads question)
     → listening (user answers)
     → transcribing (optional, when finalizing answer)
     → [repeat for each question]
     → done (on finish)
```

---

## 5. Session Completion & Results

### User Action
User views the completed session with evaluation results, scores, and feedback.

### Frontend Files

#### File: `src/app/dashboard/sessions/[sessionId]/page.jsx`
- **Logic**: When session status is "completed", renders `CompletedSessionView`

#### File: `src/components/sessions/CompletedSessionView.jsx`
- **Purpose**: Displays completed session results
- **Logic**:
  - Computes `averageByMetric` from all question stats
  - Calculates `overallScore` as average of all question scores
  - Uses `scoreFromStats()` utility from `sessionMetrics.js`
  - Displays:
    - Session title and download transcript button
    - Overall score with score band (Excellent/Good/Developing/Needs Work)
    - Metrics grid: Confidence, Knowledge, Relevance, Fluency, Clarity
    - Expandable Q&A cards with:
      - Question text
      - User's answer
      - AI feedback
      - Stronger answer suggestion
      - Per-question stats and score

#### File: `src/lib/metrics/sessionMetrics.js` (Client-side)
- **Purpose**: Replicates server-side scoring logic for display
- **Key Functions**:
  ```javascript
  scoreFromStats(stats): Calculates average of 5 metrics
  scoreQuestion(question): Gets score from question.stats
  scoreQuestions(questions): Calculates session average
  ```

### Scoring Display
- **Score Band**: Color-coded based on score thresholds
  - ≥85: Excellent (green)
  - 70-84: Good (green)
  - 50-69: Developing (amber)
  - <50: Needs Work (red)

---

## 6. State Management

### Interview Store

#### File: `src/store/interviewStore.js`
- **Purpose**: Global interview list state
- **State**:
  ```javascript
  {
    interviews: [],     // Array of interview objects
    isLoading: boolean,
    error: string | null
  }
  ```
- **Actions**:
  - `setInterviews(interviews)`: Populate after fetch
  - `setLoading(isLoading)`: Toggle loading
  - `setError(error)`: Store error message
  - `addInterview(interview)`: Add new interview
  - `removeInterview(id)`: Remove deleted interview

### Toast Store

#### File: `src/store/toastStore.js`
- **Purpose**: Global toast notification state
- **Used by**: All hooks and pages for success/error/warning messages

---

## API Endpoints Summary (Client-Side)

| Function | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| `getInterviews` | `/interviews` | GET | Fetch all user interviews |
| `getDashboardSummary` | `/interviews/dashboard/summary` | GET | Fetch aggregated stats |
| `getInterview` | `/interviews/:id` | GET | Fetch single interview detail |
| `createInterview` | `/interviews` | POST | Create new interview |
| `deleteInterview` | `/interviews/:id` | DELETE | Delete interview |
| `startAndFetchQuestions` | `/sessions/:id/generate-questions` | POST | Generate questions, start session |
| `transcribeAudio` | `/sessions/transcribe` | POST | Transcribe audio via Whisper |
| `completeSession` | `/sessions/:id/complete` | POST | Submit answers, trigger evaluation |
| `abandonSession` | `/sessions/:id/abandon` | PATCH | Mark session as abandoned |
| `getSession` | `/sessions/:id` | GET | Fetch session details |

---

## Key Architectural Patterns

1. **Service Layer Pattern**: All API calls go through service files (`interview.service.js`, `session.service.js`) to centralize HTTP contracts

2. **Hook-Based Logic**: Complex stateful logic (like live interview room) is encapsulated in custom hooks (`useInterviewRoom`) to keep UI components clean

3. **Zustand Stores**: Global UI state (interviews list, toast messages) is managed via Zustand for easy access from any component

4. **Optimistic Updates**: Interview store allows optimistic addition/removal for immediate UI feedback

5. **Error Handling**: All service calls wrap errors and show user-friendly toast messages

6. **Caching**: Interview list is cached in store to avoid re-fetching on page revisit

---

## File Dependency Graph

```
page.jsx (UI)
    ↓ uses
hooks (useInterviews, useInterviewRoom, useDashboardSummary, useInterviewDetail)
    ↓ uses  
services (interview.service.js, session.service.js)
    ↓ calls
axiosInstance → Backend API
    ↓
interviewStore.js, toastStore.js (State)
```