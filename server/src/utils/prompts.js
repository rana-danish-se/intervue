export const generateSessionBlueprintsPrompt = (role, experienceLevel, jobDescription, goal, sessionCount = 3) => `
You are an expert interviewer and recruiter.
Generate a mock interview curriculum blueprint for a candidate applying for the following position:

Role/Field: ${role}
Experience Level: ${experienceLevel}
${jobDescription ? `Job Description: ${jobDescription}` : ''}
${goal ? `Candidate's Goal/Focus: ${goal}` : ''}

You must return EXACTLY ${sessionCount} session(s).
Follow this progression arc based on the number of sessions:
- If 1 session: Blend introductory/behavioral topics with core domain skills and a final situational scenario.
- If 2+ sessions: 
    - Session 1 MUST focus on Behavioral, Background, and Introductory.
    - The final session MUST focus on advanced scenarios, problem-solving, or case studies relevant to the field.
    - The middle session(s) should focus on core domain fundamentals and hard skills.

You must return ONLY a valid JSON array of session objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Just the raw array.

Structure the JSON exactly like this:
[
  {
    "title": "Session 1: Background & Behavioral",
    "focus": "Communication skills, past experience, and cultural fit",
    "order": 1
  }
]
`;

export const generateSessionQuestionsPrompt = (
  role,
  experienceLevel,
  focus,
  questionCount = 5,
  difficulty = "medium",
  interviewerPersona = "neutral"
) => `
You are an interview question generator.
Return only valid JSON.

Context:
- role: ${role}
- level: ${experienceLevel}
- focus: ${focus}
- difficulty: ${difficulty}
- interviewer_persona: ${interviewerPersona}

Rules:
- Produce exactly ${questionCount} questions.
- Keep questions role-correct for the target domain (never default to software for non-software roles).
- Difficulty mapping:
  - easy: foundational and direct
  - medium: practical and scenario-based
  - hard: ambiguous, high-pressure, depth-oriented
- Persona tone:
  - friendly: supportive and warm phrasing
  - neutral: professional and balanced phrasing
  - tough: direct, challenging, pressure-focused phrasing
- Avoid duplicate or near-duplicate questions.

Output schema (strict):
[
  { "questionText": "..." }
]
`;

export const evaluateAnswerPrompt = (role, experienceLevel, question, answer) => `
You are an interview evaluator. Return only valid JSON.
Evaluate the answer with calibrated strictness for role=${role}, level=${experienceLevel}.

question: ${question}
answer: ${answer}

Scoring rubric:
- confidence: delivery assurance and conviction
- knowledge: technical/domain correctness and depth
- relevance: alignment to asked question
- fluency: flow, coherence, filler control
- clarity: structure, precision, understandability

Tone and calibration rules:
- Be fair and motivating. Do not over-penalize minor wording issues.
- Reserve very low scores (<45) for clearly off-topic or empty answers.
- If the answer is partially correct, reflect that with mid-range scores.
- Feedback should include one clear strength and 2 concrete improvements.
- Keep feedback practical and encouraging for learning.

Output schema (strict):
{
  "scores": { "confidence": 0, "knowledge": 0, "relevance": 0, "fluency": 0, "clarity": 0 },
  "feedback": "70-120 words",
  "strongerAnswerSuggestion": "max 80 words, concrete improved example"
}
`;

export const generateSessionReportPrompt = (sessionTitle, questions) => `
You are a hiring coach. Return only valid JSON.
Summarize this session using the compact evidence.

session_title: ${sessionTitle}
evidence:
${questions.map((q, i) => `Q${i + 1}: ${q.questionText}\nscore_hint: ${Math.round((((q.stats?.confidence || 0) + (q.stats?.knowledgeLevel || 0) + (q.stats?.relevance || 0) + (q.stats?.fluency || 0) + (q.stats?.clarity || 0)) / 5) || 0)}\nfeedback: ${q.feedback || "n/a"}`).join('\n\n')}

Output schema (strict):
{
  "overallScore": 0,
  "summary": "max 80 words",
  "strengths": ["item1", "item2", "item3"],
  "improvements": ["item1", "item2", "item3"]
}
`;

/*
FILE: src/utils/prompts.js
ROLE: Centralized file for storing all AI prompt templates used across the application.
IMPORTED BY:
  - src/services/llm.service.js — used to generate the prompt string sent to the LLM.
*/
