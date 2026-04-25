import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSessionBlueprintsPrompt, generateSessionQuestionsPrompt } from "../utils/prompts.js";

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
    jsonResponseString = completion.choices[0]?.message?.content || "[]";
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
  
  if (!jsonResponseString.startsWith('[')) {
    jsonResponseString = `[${jsonResponseString}]`;
  }

  return JSON.parse(jsonResponseString);
};

export const generateSessionBlueprints = async (interviewDetails) => {
  const { role, experienceLevel, jobDescription, goal, sessionCount } = interviewDetails;
  const prompt = generateSessionBlueprintsPrompt(role, experienceLevel, jobDescription, goal, sessionCount);

  try {
    return await callLLM(prompt);
  } catch (error) {
    console.error('LLM Blueprint Generation Error:', error);
    throw new Error('Failed to generate interview blueprints: ' + error.message);
  }
};

export const generateSessionQuestions = async (role, experienceLevel, focus, questionCount = 5) => {
  const prompt = generateSessionQuestionsPrompt(role, experienceLevel, focus, questionCount);

  try {
    return await callLLM(prompt);
  } catch (error) {
    console.error('LLM Question Generation Error:', error);
    throw new Error('Failed to generate session questions: ' + error.message);
  }
};

/*
FILE: src/services/llm.service.js
ROLE: Service for interacting with LLM providers (Gemini or Groq) to generate interview sessions and questions.
IMPORTED BY:
  - src/services/interview.service.js — to generate sessions upon interview creation.
*/
