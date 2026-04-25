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

export const generateSessionQuestionsPrompt = (role, experienceLevel, focus, questionCount = 5) => `
You are an expert interviewer and recruiter.
You are conducting a mock interview session for a candidate. 

Role/Field: ${role}
Experience Level: ${experienceLevel}
Session Focus Area: ${focus}

CRITICAL INSTRUCTION: Adapt your questions to the NATURAL SETTING of the specified Role/Field. If this is a non-technical role (e.g., Marketing, Nursing, Sales, Design, Management), do NOT ask software engineering questions. Use scenarios, terminology, and fundamentals specific to THAT industry.

Generate exactly ${questionCount} questions for this specific session. The questions should progressively get more difficult.
You must return ONLY a valid JSON array of question objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Just the raw array.

Structure the JSON exactly like this:
[
  {
    "questionText": "Can you tell me about a time you had to resolve a conflict with a coworker?"
  }
]
`;

/*
FILE: src/utils/prompts.js
ROLE: Centralized file for storing all AI prompt templates used across the application.
IMPORTED BY:
  - src/services/llm.service.js — used to generate the prompt string sent to the LLM.
*/
