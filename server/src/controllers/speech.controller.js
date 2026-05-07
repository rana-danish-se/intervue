/*
Role: Speech transcription HTTP controller.
What it does: Validates uploaded audio payloads and delegates STT execution to the LLM speech service.
Where used: Mounted by session routes for `/sessions/transcribe`.
Why it exists: Keeps file/mime safety checks close to request boundaries before expensive provider calls.
*/

import { transcribeAudio } from '../services/llm.service.js';
import AppError from '../utils/AppError.js';

export const transcribeAudioController = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No audio file provided', 400));
    }
    if (req.file.size < 512) {
      return res.status(200).json({ success: true, text: "" });
    }
    const allowedMime = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (req.file.mimetype && !allowedMime.includes(req.file.mimetype)) {
      return next(new AppError('Unsupported audio format for transcription', 400));
    }

    const text = await transcribeAudio(req.file.buffer);

    res.status(200).json({
      success: true,
      text: text || "",
    });
  } catch (error) {
    next(error);
  }
};
