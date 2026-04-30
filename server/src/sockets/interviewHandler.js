import Session from '../models/Session.model.js';
import Interview from '../models/Interview.model.js';
import { evaluateAnswer, generateSessionReport } from '../services/llm.service.js';

export const handleInterviewSocket = (io, socket) => {
  
  // Join a specific session room
  socket.on('join_session', async ({ sessionId }) => {
    try {
      const session = await Session.findById(sessionId);
      if (!session) return socket.emit('error', { message: 'Session not found' });

      const interview = await Interview.findById(session.interviewId);
      if (interview.userId.toString() !== socket.user._id.toString()) {
        return socket.emit('error', { message: 'Not authorized' });
      }

      socket.join(`session_${sessionId}`);
      console.log(`User ${socket.user.firstName} joined session ${sessionId}`);
      
      socket.emit('session_joined', { 
        success: true, 
        message: 'Successfully joined interview room',
        title: session.title
      });
    } catch (err) {
      console.error('Join Session Error:', err);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  // Start the interview
  socket.on('start_interview', async ({ sessionId }) => {
    try {
      const session = await Session.findById(sessionId);
      if (!session || session.questions.length === 0) {
        return socket.emit('error', { message: 'Questions not generated yet. Please go back and generate them.' });
      }

      // Update session status
      session.status = 'in-progress';
      await session.save();

      // Emit the first question
      const firstQuestion = session.questions[0];
      socket.emit('next_question', {
        questionIndex: 0,
        questionText: firstQuestion.questionText,
        totalQuestions: session.questions.length
      });

    } catch (err) {
      console.error('Start Interview Error:', err);
      socket.emit('error', { message: 'Failed to start interview' });
    }
  });

  // Receive answer and evaluate
  socket.on('submit_answer', async ({ sessionId, questionIndex, answerText }) => {
    try {
      const session = await Session.findById(sessionId);
      const interview = await Interview.findById(session.interviewId);
      
      const currentQuestion = session.questions[questionIndex];
      currentQuestion.userResponseText = answerText;

      // Evaluate the answer using LLM
      const evaluation = await evaluateAnswer({
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        question: currentQuestion.questionText,
        answer: answerText
      });

      // Save evaluation to DB
      currentQuestion.feedback = evaluation.feedback;
      currentQuestion.stats = {
        confidence: evaluation.scores.confidence,
        knowledgeLevel: evaluation.scores.knowledge,
        relevance: evaluation.scores.relevance,
        fluency: evaluation.scores.fluency,
        clarity: evaluation.scores.clarity
      };

      await session.save();

      // Check if there are more questions
      if (questionIndex + 1 < session.questions.length) {
        const nextQuestion = session.questions[questionIndex + 1];
        socket.emit('next_question', {
          questionIndex: questionIndex + 1,
          questionText: nextQuestion.questionText,
          totalQuestions: session.questions.length,
          previousFeedback: evaluation.feedback // Optional: provide quick feedback to user
        });
      } else {
        // All questions finished
        socket.emit('all_questions_completed');
        
        // Generate final report in background
        session.status = 'completed';
        await session.save();
        
        const report = await generateSessionReport(session);
        // We could emit the report or just let user navigate to report page
        socket.emit('interview_completed', { report });
      }

    } catch (err) {
      console.error('Submit Answer Error:', err);
      socket.emit('error', { message: 'Failed to process answer' });
    }
  });
};

/*
FILE: src/sockets/interviewHandler.js
ROLE: Handles real-time interview flow logic including joining rooms, 
      advancing questions, and triggering LLM evaluations.
IMPORTED BY:
  - src/sockets/socketManager.js
*/
