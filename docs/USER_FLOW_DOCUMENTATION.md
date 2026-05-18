# Intervue Complete User Flow Documentation

## Overview

This document traces the complete user journey from interview creation through live interview conduction to final evaluation and results. Each step identifies the key backend files involved and explains the business logic (excluding UI components).

---

## Table of Contents

1. [Interview Creation](#1-interview-creation)
2. [Session Blueprint Generation](#2-session-blueprint-generation)
3. [Starting a Session (Question Generation)](#3-starting-a-session-question-generation)
4. [Live Interview Conduction](#4-live-interview-conduction)
5. [Session Completion & Answer Evaluation](#5-session-completion--answer-evaluation)
6. [Results Display & Dashboard Aggregation](#6-results-display--dashboard-aggregation)

---

## 1. Interview Creation

### User Action
User fills out a form with: role, experience level, job description, goal, and session count (1-5).

### Backend Flow

#### File: `src/controllers/interview.controller.js`
- **`createInterview`** handler receives the request body
- Validates all required fields:
  - `role`: string, max 50 chars
  - `experienceLevel`: must be "junior", "mid", or "senior"
  - `sessionCount`: integer between 1-5 (defaults to 3)
- Extracts `userId` from `req.user` (set by auth middleware)
- Calls service layer with validated data

#### File: `src/services/interview.service.js`
- **`createInterview`** function:
  1. Creates an `Interview` document in MongoDB
  2. Calls LLM to generate session blueprints (see step 2)
  3. Creates corresponding `Session` documents with `status: 'pending'`
  4. Returns both the interview and created sessions

#### File: `src/models/Interview.model.js`
- Stores: userId, role, experienceLevel, jobDescription, goal, sessionCount
- Default sessionCount is 3

### Response
```json
{
  "success": true,
  "interview": { ... },
  "sessions": [ ... ]
}
```

---

## 2. Session Blueprint Generation

### Purpose
Instead of hardcoded session titles, the system uses AI to generate meaningful session titles and focuses based on the job role.

### Backend Flow

#### File: `src/services/llm.service.js`
- **`generateSessionBlueprints`** function:
  1. Builds a prompt using `generateSessionBlueprintsPrompt` (from prompts.js)
  2. Sends prompt to LLM (Groq or Gemini)
  3. Parses JSON response
  4. Returns an array of session blueprints

#### File: `src/utils/prompts.js`
- **`generateSessionBlueprintsPrompt`**:
  - Instructs LLM to generate sessionCount sessions
  - Enforces progression arc:
    - Session 1: Behavioral/Background
    - Middle sessions: Core domain fundamentals
    - Final session: Advanced scenarios/case studies
  - Output format: `[{ "title": "...", "focus": "...", "order": 1 }]`

#### File: `src/services/interview.service.js`
- Receives blueprints and maps them to Session documents:
  ```javascript
  {
    interviewId: interview._id,
    title: session.title,
    focus: session.focus,
    order: session.order,
    questions: [], // empty, generated on-demand
    status: 'pending'
  }
  ```
- Uses `Session.insertMany()` for bulk insertion

---

## 3. Starting a Session (Question Generation)

### User Action
User clicks "Start Session" on a pending session, optionally selecting difficulty and interviewer persona.

### Backend Flow

#### File: `src/controllers/session.controller.js`
- **`generateQuestions`** handler:
  1. Gets session ID from URL params
  2. Gets difficulty/persona from request body
  3. Calls `getAuthorizedSessionAndInterview` to verify ownership
  4. **Caching check**: If session already has 5+ questions, returns cached set
  5. Otherwise calls LLM service to generate questions

#### File: `src/services/llm.service.js`
- **`generateSessionQuestions`** function:
  1. Builds prompt using `generateSessionQuestionsPrompt` (prompts.js)
  2. **Smart unwrapping**: Handles both bare arrays and wrapped responses (`{ "questions": [...] }`)
  3. Normalizes question format to `{ questionText: "..." }`
  4. Returns array of 5 questions

#### File: `src/utils/prompts.js`
- **`generateSessionQuestionsPrompt`**:
  - Accepts: role, experienceLevel, focus, questionCount (5), difficulty, persona
  - Difficulty mapping:
    - easy: foundational/direct questions
    - medium: practical/scenario-based
    - hard: ambiguous/high-pressure/depth-oriented
  - Persona tone:
    - friendly: supportive phrasing
    - neutral: professional/balanced
    - tough: direct/challenging

#### File: `src/controllers/session.controller.js`
- Updates session:
  - `session.questions = generatedQuestions`
  - `session.status = 'in-progress'`
  - `session.difficulty`, `session.interviewerPersona` saved
- Returns questions to client

---

## 4. Live Interview Conduction

### User Action
User answers questions via voice or typed input. The client polls or uses WebSocket for real-time updates.

### Data Flow (Server-Side)

#### File: `src/controllers/session.controller.js`
- **`getSessionById`** handler:
  - Returns current session state including questions
  - Used by client to fetch session on page load

#### State Transitions During Interview
```
pending → in-progress → processing → completed
                      → abandoned (if user exits early)
```

#### Audio Transcription
- File: `src/services/llm.service.js` → **`transcribeAudio`**
- Uses Groq Whisper API
- Filters out hallucinations (common phrases like "Subtitles by")
- Returns transcribed text

### Client Handles
- Recording audio chunks
- Sending to transcription endpoint
- Streaming questions one at a time
- Managing timer

---

## 5. Session Completion & Answer Evaluation

### User Action
User finishes last question or clicks "Finish Session".

### Backend Flow

#### File: `src/controllers/session.controller.js`
- **`completeSession`** handler (or `evaluateSession`):
  1. Receives array of `{ questionId, answerText }`
  2. Updates each question's `userResponseText`
  3. Sets session status to `'processing'` (client shows loading)
  4. Triggers **async background evaluation**:

##### Background Processing (Non-blocking)
```javascript
(async () => {
  for (const question of session.questions) {
    // Skip empty answers
    if (!question.userResponseText?.trim()) {
      question.stats = { confidence: 0, knowledgeLevel: 0, ... };
      question.feedback = "This question was skipped.";
      continue;
    }

    // Call LLM to evaluate each answer
    const evaluation = await llmService.evaluateAnswer({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      question: question.questionText,
      answer: question.userResponseText
    });

    // Apply score calibration
    question.stats = {
      confidence: calibrateScore(evaluation.scores?.confidence),
      knowledgeLevel: calibrateScore(evaluation.scores?.knowledge),
      relevance: calibrateScore(evaluation.scores?.relevance),
      fluency: calibrateScore(evaluation.scores?.fluency),
      clarity: calibrateScore(evaluation.scores?.clarity),
    };
    question.feedback = evaluation.feedback;
    question.strongerAnswerSuggestion = evaluation.strongerAnswerSuggestion;
  }

  session.status = 'completed';
  await session.save();
})();
```

#### Score Calibration (File: `session.controller.js`)
- **`calibrateScore`** function:
  - Prevents overly harsh scoring
  - Adds soft bonuses for low/medium scores
  - Examples:
    - Raw 30 → calibrated to 45
    - Raw 55 → calibrated to 65

#### File: `src/utils/prompts.js`
- **`evaluateAnswerPrompt`**:
  - LLM returns: `{ scores: { confidence, knowledge, relevance, fluency, clarity }, feedback, strongerAnswerSuggestion }`
  - Feedback must include: 1 strength + 2 improvements
  - Scores range 0-100

#### File: `src/services/llm.service.js`
- **`evaluateAnswer`** function:
  - Sends prompt to LLM
  - Returns structured evaluation object

### Final Session State
```javascript
{
  status: 'completed',
  questions: [
    {
      questionText: "...",
      userResponseText: "...",
      stats: { confidence: 75, knowledgeLevel: 80, ... },
      feedback: "Great answer...",
      strongerAnswerSuggestion: "You could improve by..."
    },
    ...
  ]
}
```

---

## 6. Results Display & Dashboard Aggregation

### User Action
User views completed session results or dashboard with aggregate scores.

### Backend Flow

#### File: `src/controllers/session.controller.js`
- **`getSessionById`** handler:
  - Calculates `overallScore` using `scoreQuestions()` utility
  - Returns session with all questions, answers, stats, feedback

#### File: `src/utils/sessionMetrics.js`
- **`scoreQuestion`**: Calculates average of 5 metrics for one question
- **`scoreQuestions`**: Calculates overall session score (average of all question scores)
- Returns null if no stats available

#### File: `src/controllers/interview.controller.js`
- **`getInterview`** handler:
  - Fetches interview + all its sessions
  - Calls `buildInterviewVerdict()` from service

#### File: `src/services/interview.service.js`
- **`buildInterviewVerdict`** function:
  - Aggregates completed session scores
  - Calculates:
    - `averageScore`: mean of all question averages
    - `completionRate`: completed sessions / total sessions
    - `recencyBoost`: bonus for sessions in last 30 days
    - `readinessScore`: weighted formula (70% score + 20% completion + 10% recency)
    - `hiringProbability`: high (≥75), medium (≥55), low
  - Computes metric averages: confidence, knowledge, relevance, fluency, clarity
  - Identifies weakest/strongest sessions

#### File: `src/controllers/interview.controller.js`
- **`getDashboardSummary`** handler:
  - Aggregates across ALL user's interviews
  - Returns: totalInterviews, totalSessions, avgScore, completedSessions, readinessScore, hiringProbability, scoreDelta, weakestTopic, retakeSuggestion

---

## Data Models Summary

### Interview Model
```javascript
{
  userId: ObjectId,
  role: String,
  experienceLevel: "junior" | "mid" | "senior",
  jobDescription: String,
  goal: String,
  sessionCount: Number (1-5),
  status: "draft" | "in-progress" | "completed"
}
```

### Session Model
```javascript
{
  interviewId: ObjectId,
  title: String,
  focus: String,
  difficulty: "easy" | "medium" | "hard",
  interviewerPersona: "friendly" | "neutral" | "tough",
  order: Number,
  status: "pending" | "in-progress" | "processing" | "completed" | "abandoned",
  questions: [Question]
}
```

### Question (Embedded)
```javascript
{
  questionText: String,
  userResponseText: String,
  stats: {
    confidence: Number,
    knowledgeLevel: Number,
    relevance: Number,
    fluency: Number,
    clarity: Number
  },
  feedback: String,
  strongerAnswerSuggestion: String
}
```

---

## Key Service Functions Summary

| Function | File | Purpose |
|----------|------|---------|
| `createInterview` | interview.service.js | Creates interview + generates session blueprints |
| `generateSessionBlueprints` | llm.service.js | AI generates session titles/themes |
| `generateSessionQuestions` | llm.service.js | AI generates 5 interview questions |
| `evaluateAnswer` | llm.service.js | AI evaluates single answer |
| `transcribeAudio` | llm.service.js | Whisper transcription |
| `scoreQuestion` | sessionMetrics.js | Calculate single question score |
| `scoreQuestions` | sessionMetrics.js | Calculate session average score |
| `buildInterviewVerdict` | interview.service.js | Aggregate metrics for interview |
| `getDashboardSummary` | interview.service.js | Aggregate all user stats |

---

## Error Handling Patterns

1. **Validation Errors**: Handled in controllers, return 400 with specific message
2. **Not Found**: Service throws `AppError(404, 'Not found')`
3. **Authorization**: Service throws `AppError(403, 'Not authorized')`
4. **LLM Failures**: Caught and re-thrown with context, interview still created but blueprints may fail
5. **Background Evaluation Failures**: Caught, session marked 'completed' anyway to prevent user stuck state

---

## Notes

- Questions are generated **on-demand** (lazy generation), not during interview creation
- Sessions can be cached if 5+ questions exist
- Evaluation runs asynchronously to not block HTTP response
- Score calibration prevents harsh AI grading from demotivating users
- Dashboard aggregates data across ALL interviews for the user