/*
Role: AI provider integration service.
What it does: Handles prompt execution for question generation/evaluation/reporting plus speech-to-text transcription with provider-specific settings.
Where used: Called by interview/session controllers and socket interview handler.
Why it exists: Isolates provider SDK details from domain/business logic.
*/

import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { 
  generateSessionBlueprintsPrompt, 
  generateSessionQuestionsPrompt,
  evaluateAnswerPrompt,
  generateSessionReportPrompt
} from "../utils/prompts.js";
import AppError from '../utils/AppError.js';

// Helper function to handle the LLM call abstraction
const callLLM = async (prompt) => {
  let jsonResponseString = '';

  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    jsonResponseString = completion.choices[0]?.message?.content || "{}";
  } else if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });
    
    jsonResponseString = result.response.text();
  } else {
    // Graceful failure when no provider configured
    throw new AppError('AI provider not configured. Please set GROQ_API_KEY or GEMINI_API_KEY in the environment.', 503);
  }

  // Clean markdown block if present
  jsonResponseString = jsonResponseString.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(jsonResponseString);
  } catch (parseError) {
    const jsonStart = jsonResponseString.indexOf("{");
    const jsonEnd = jsonResponseString.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(jsonResponseString.slice(jsonStart, jsonEnd + 1));
    }
    throw parseError;
  }
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

export const generateSessionQuestions = async (
  role,
  experienceLevel,
  focus,
  questionCount = 5,
  difficulty = "medium",
  interviewerPersona = "neutral"
) => {
  const prompt = generateSessionQuestionsPrompt(role, experienceLevel, focus, questionCount, difficulty, interviewerPersona);

  try {
    const result = await callLLM(prompt);
    const arr = Array.isArray(result) ? result : [result];
    
    // Robust mapping to handle LLM returning different keys like "question" instead of "questionText"
    return arr.map(q => {
      if (typeof q === 'string') return { questionText: q };
      const text = q.questionText || q.question || q.text || q.Q || "Could you elaborate on your experience in this area?";
      return { questionText: String(text) };
    });
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

export const transcribeAudio = async (audioBuffer) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('GROQ_API_KEY is not configured for transcription.', 503);
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  // Create a temporary file to send to Groq
  // Whisper requires an actual file stream with a known extension like webm or mp3
  const tmpFilePath = path.join(os.tmpdir(), `audio-${Date.now()}-${Math.floor(Math.random() * 1000)}.webm`);
  fs.writeFileSync(tmpFilePath, audioBuffer);
  
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpFilePath),
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "en",
      prompt: "The following is a candidate's answer in an interview in English.",
      temperature: 0.0,
    });
    
    // Filter out common whisper hallucinations
    const text = (transcription.text || "").trim();
    const isHallucination = [
      "Subtitles by", "Amara.org", "Thank you", "視聴してくれてありがとう",
      "subscribe", "Thanks for watching"
    ].some(phrase => text.toLowerCase().includes(phrase.toLowerCase()));
    
    if (isHallucination && text.split(' ').length < 10) {
      return "";
    }
    
    if (!text) return "";
    if (text.length < 3) return "";
    return text;
  } catch (error) {
    console.error('LLM Transcription Error:', error);
    throw new Error('Failed to transcribe audio: ' + error.message);
  } finally {
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath);
    }
  }
};

