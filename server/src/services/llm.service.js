import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  generateSessionBlueprintsPrompt, 
  generateSessionQuestionsPrompt,
  evaluateAnswerPrompt,
  generateSessionReportPrompt
} from "../utils/prompts.js";

// Helper function to handle the LLM call abstraction
const callLLM = async (prompt) => {
  let jsonResponseString = '';

  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    jsonResponseString = completion.choices[0]?.message?.content || "{}";
  } else if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });
    
    jsonResponseString = result.response.text();
  } else {
    throw new Error('No AI provider configured. Please set GEMINI_API_KEY or GROQ_API_KEY.');
  }

  // Clean markdown block if present
  jsonResponseString = jsonResponseString.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  return JSON.parse(jsonResponseString);
};

export const generateSessionBlueprints = async (interviewDetails) => {
  const { role, experienceLevel, jobDescription, goal, sessionCount } = interviewDetails;
  const prompt = generateSessionBlueprintsPrompt(role, experienceLevel, jobDescription, goal, sessionCount);

  try {
    const result = await callLLM(prompt);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error('LLM Blueprint Generation Error:', error);
    throw new Error('Failed to generate interview blueprints: ' + error.message);
  }
};

export const generateSessionQuestions = async (role, experienceLevel, focus, questionCount = 5) => {
  const prompt = generateSessionQuestionsPrompt(role, experienceLevel, focus, questionCount);

  try {
    const result = await callLLM(prompt);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error('LLM Question Generation Error:', error);
    throw new Error('Failed to generate session questions: ' + error.message);
  }
};

export const evaluateAnswer = async ({ role, experienceLevel, question, answer }) => {
  const prompt = evaluateAnswerPrompt(role, experienceLevel, question, answer);

  try {
    return await callLLM(prompt);
  } catch (error) {
    console.error('LLM Evaluation Error:', error);
    throw new Error('Failed to evaluate answer: ' + error.message);
  }
};

export const generateSessionReport = async (session) => {
  const prompt = generateSessionReportPrompt(session.title, session.questions);

  try {
    return await callLLM(prompt);
  } catch (error) {
    console.error('LLM Report Generation Error:', error);
    throw new Error('Failed to generate session report: ' + error.message);
  }
};

/*
FILE: src/services/llm.service.js
ROLE: Service for interacting with LLM providers (Gemini or Groq) to generate interview sessions, 
      questions, evaluations, and reports.
IMPORTED BY:
  - src/services/interview.service.js
  - src/sockets/interviewHandler.js
*/
