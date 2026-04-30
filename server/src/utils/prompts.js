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

export const evaluateAnswerPrompt = (role, experienceLevel, question, answer) => `
You are an expert interviewer. Evaluate the candidate's answer to the following question:

Role: ${role}
Level: ${experienceLevel}
Question: ${question}
Candidate's Answer: ${answer}

Provide a constructive evaluation. 
Return a JSON object with:
- scores: { confidence (0-100), knowledge (0-100), relevance (0-100), fluency (0-100), clarity (0-100) }
- feedback: A brief (1-2 sentences) feedback string.

Example:
{
  "scores": { "confidence": 80, "knowledge": 75, "relevance": 90, "fluency": 85, "clarity": 80 },
  "feedback": "Good use of examples, but try to be more concise in explaining the technical details."
}
`;

export const generateSessionReportPrompt = (sessionTitle, questions) => `
You are an expert career coach. Analyze the following interview session results and provide a final summary report.

Session: ${sessionTitle}
Questions & Answers:
${questions.map((q, i) => `Q${i+1}: ${q.questionText}\nA${i+1}: ${q.userResponseText}\nFeedback: ${q.feedback}`).join('\n\n')}

Return a JSON object with:
- overallScore: (0-100)
- summary: A 2-3 sentence summary of performance.
- strengths: [list of 3 strings]
- improvements: [list of 3 strings]

Example:
{
  "overallScore": 78,
  "summary": "The candidate showed strong domain knowledge but struggled with situational behavior questions.",
  "strengths": ["Technical accuracy", "Confidence", "Problem-solving"],
  "improvements": ["Communication clarity", "Time management", "Specific examples"]
}
`;

/*
FILE: src/utils/prompts.js
ROLE: Centralized file for storing all AI prompt templates used across the application.
IMPORTED BY:
  - src/services/llm.service.js — used to generate the prompt string sent to the LLM.
*/
