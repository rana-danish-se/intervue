import Interview from '../models/Interview.model.js';
import Session from '../models/Session.model.js';
import * as llmService from './llm.service.js';
import AppError from '../utils/AppError.js';
import { scoreQuestion } from '../utils/sessionMetrics.js';

/*
Role: Interview domain service layer.
What it does: Owns interview CRUD, dashboard aggregation, and track-level readiness/verdict computation based on session performance.
Where used: Called by interview controllers to keep HTTP handlers thin and deterministic.
Why it exists: Centralizes interview business rules and analytics in one reusable boundary.
*/

const buildInterviewVerdict = (sessions) => {
  const completedSessions = (sessions || []).filter((s) => s.status === "completed");
  const scoredSessions = completedSessions
    .map((session) => {
      const questionScores = (session.questions || [])
        .map(scoreQuestion)
        .filter((value) => value !== null);
      if (questionScores.length === 0) return null;
      return {
        sessionId: session._id,
        title: session.title,
        focus: session.focus || "General Expertise",
        updatedAt: session.updatedAt,
        score: Math.round(questionScores.reduce((acc, value) => acc + value, 0) / questionScores.length),
        questions: session.questions || [],
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const averageScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((acc, row) => acc + row.score, 0) / scoredSessions.length)
    : null;
  const completionRate = sessions.length > 0 ? completedSessions.length / sessions.length : 0;
  const recencyBoost = scoredSessions.length > 0
    ? Math.min(1, scoredSessions.filter((row) => Date.now() - new Date(row.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 30).length / 3)
    : 0;
  const readinessScore = Math.round((((averageScore || 0) / 100) * 0.7 + completionRate * 0.2 + recencyBoost * 0.1) * 100);
  const hiringProbability = readinessScore >= 75 ? "high" : readinessScore >= 55 ? "medium" : "low";

  const metricTotals = { confidence: 0, knowledge: 0, relevance: 0, fluency: 0, clarity: 0 };
  let metricCount = 0;
  scoredSessions.forEach((session) => {
    session.questions.forEach((q) => {
      const s = q.stats || {};
      if (
        typeof s.confidence === "number" &&
        typeof s.knowledgeLevel === "number" &&
        typeof s.relevance === "number" &&
        typeof s.fluency === "number" &&
        typeof s.clarity === "number"
      ) {
        metricTotals.confidence += s.confidence;
        metricTotals.knowledge += s.knowledgeLevel;
        metricTotals.relevance += s.relevance;
        metricTotals.fluency += s.fluency;
        metricTotals.clarity += s.clarity;
        metricCount += 1;
      }
    });
  });
  const metricAverages = metricCount > 0
    ? {
        confidence: Math.round(metricTotals.confidence / metricCount),
        knowledge: Math.round(metricTotals.knowledge / metricCount),
        relevance: Math.round(metricTotals.relevance / metricCount),
        fluency: Math.round(metricTotals.fluency / metricCount),
        clarity: Math.round(metricTotals.clarity / metricCount),
      }
    : null;

  const weakestSession = scoredSessions.slice().sort((a, b) => a.score - b.score)[0] || null;
  const strongestSession = scoredSessions.slice().sort((a, b) => b.score - a.score)[0] || null;
  const improvementAreas = metricAverages
    ? Object.entries(metricAverages)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .map(([metric]) => metric)
    : [];

  return {
    readinessScore,
    hiringProbability,
    averageScore,
    metricAverages,
    improvementAreas,
    strongestSession: strongestSession
      ? { sessionId: strongestSession.sessionId, title: strongestSession.title, score: strongestSession.score }
      : null,
    weakestSession: weakestSession
      ? { sessionId: weakestSession.sessionId, title: weakestSession.title, score: weakestSession.score, focus: weakestSession.focus }
      : null,
  };
};

export const createInterview = async (interviewData) => {
  const interview = await Interview.create(interviewData);
  let insertedSessions = [];

  try {
    const blueprints = await llmService.generateSessionBlueprints(interviewData);
    
    const sessionsToInsert = blueprints.map(session => ({
      ...session,
      interviewId: interview._id,
      questions: [], // start empty for JIT generation
      status: 'pending'
    }));

    insertedSessions = await Session.insertMany(sessionsToInsert);
  } catch (error) {
    throw new AppError('Interview created, but failed to generate session blueprints: ' + error.message, 500);
  }

  return { interview, sessions: insertedSessions };
};

export const getUserInterviews = async (userId) => {
  const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
  if (interviews.length === 0) return [];

  const interviewIds = interviews.map((interview) => interview._id);
  const sessions = await Session.find({ interviewId: { $in: interviewIds } }).select(
    "interviewId status questions difficulty createdAt updatedAt"
  );

  const sessionsByInterview = sessions.reduce((acc, session) => {
    const key = session.interviewId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  const withStats = interviews.map((interview) => {
    const keyedSessions = sessionsByInterview[interview._id.toString()] || [];
    const totalSessions = keyedSessions.length;
    const completedSessions = keyedSessions.filter((s) => s.status === "completed");
    const nextSession =
      keyedSessions.find((session) => session.status === "pending") ||
      keyedSessions.find((session) => session.status === "in-progress") ||
      keyedSessions[0] ||
      null;

    const lastPracticedAt =
      keyedSessions.length > 0
        ? keyedSessions.reduce(
            (latest, session) =>
              new Date(session.updatedAt) > new Date(latest) ? session.updatedAt : latest,
            keyedSessions[0].updatedAt
          )
        : null;

    let scoreSum = 0;
    let scoredQuestions = 0;

    completedSessions.forEach((session) => {
      (session.questions || []).forEach((question) => {
        const score = scoreQuestion(question);
        if (typeof score === "number") {
          scoreSum += score;
          scoredQuestions += 1;
        }
      });
    });

    const averageScore = scoredQuestions > 0 ? Math.round(scoreSum / scoredQuestions) : null;
    const progressStatus =
      totalSessions > 0 && completedSessions.length === totalSessions ? "completed" : "active";

    return {
      ...interview.toObject(),
      totalSessions,
      completedSessions: completedSessions.length,
      lastPracticedAt,
      averageScore,
      progressStatus,
      nextSessionId: nextSession?._id || null,
    };
  });

  return withStats;
};

export const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }
  if (interview.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this interview', 403);
  }

  const sessions = await Session.find({ interviewId }).sort({ order: 1 });
  const verdict = buildInterviewVerdict(sessions);
  return { ...interview.toObject(), sessions, verdict };
};

export const getDashboardSummary = async (userId) => {
  const interviews = await getUserInterviews(userId);
  const interviewIds = interviews.map((interview) => interview._id);
  const allSessions = await Session.find({ interviewId: { $in: interviewIds } })
    .sort({ updatedAt: -1 })
    .lean();
  const sessions = allSessions.slice(0, 6);

  const totalInterviews = interviews.length;
  const totalSessions = interviews.reduce(
    (sum, interview) => sum + (interview.totalSessions || 0),
    0
  );

  let scoredQuestionCount = 0;
  let scoreSum = 0;
  interviews.forEach((interview) => {
    if (typeof interview.averageScore === "number") {
      scoreSum += interview.averageScore;
      scoredQuestionCount += 1;
    }
  });

  const avgScore = scoredQuestionCount > 0 ? Math.round(scoreSum / scoredQuestionCount) : null;

  const completedSessionRows = allSessions
    .filter((session) => session.status === "completed")
    .map((session) => {
      const perQuestion = (session.questions || [])
        .map(scoreQuestion)
        .filter((value) => value !== null);
      const score = perQuestion.length > 0
        ? Math.round(perQuestion.reduce((acc, value) => acc + value, 0) / perQuestion.length)
        : null;
      return { ...session, score };
    })
    .filter((session) => typeof session.score === "number");

  const recentActivity = sessions.map((session) => {
    const interview = interviews.find(
      (item) => String(item._id) === String(session.interviewId)
    );
    const stats = (session.questions || [])
      .map(scoreQuestion)
      .filter((value) => value !== null);

    const sessionScore =
      stats.length > 0
        ? Math.round(stats.reduce((acc, value) => acc + value, 0) / stats.length)
        : null;

    return {
      id: session._id,
      interviewId: session.interviewId,
      interviewRole: interview?.role || "Interview",
      title: session.title,
      status: session.status,
      score: sessionScore,
      updatedAt: session.updatedAt,
    };
  });

  const completedCount = allSessions.filter((item) => item.status === "completed").length;
  const completionRate = totalSessions > 0 ? completedCount / totalSessions : 0;
  const recencyBoost = completedSessionRows.length > 0
    ? Math.min(1, completedSessionRows.filter((row) => Date.now() - new Date(row.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 30).length / 4)
    : 0;
  const normalizedAvg = typeof avgScore === "number" ? avgScore / 100 : 0;
  const readinessScore = Math.round((normalizedAvg * 0.65 + completionRate * 0.25 + recencyBoost * 0.1) * 100);

  const weakestTopic = completedSessionRows.reduce((weakest, row) => {
    if (!row.focus || typeof row.score !== "number") return weakest;
    if (!weakest[row.focus]) weakest[row.focus] = { total: 0, count: 0 };
    weakest[row.focus].total += row.score;
    weakest[row.focus].count += 1;
    return weakest;
  }, {});

  const weakestTopicEntry = Object.entries(weakestTopic)
    .map(([focus, value]) => ({ focus, avg: Math.round((value.total / value.count) * 10) / 10, count: value.count }))
    .sort((a, b) => a.avg - b.avg)[0] || null;

  const latestCompleted = completedSessionRows[0] || null;
  const previousCompleted = completedSessionRows[1] || null;
  const scoreDelta = latestCompleted && previousCompleted
    ? latestCompleted.score - previousCompleted.score
    : null;

  const weakestSession = completedSessionRows
    .slice()
    .sort((a, b) => a.score - b.score)[0] || null;

  const hiringProbability = readinessScore >= 75 ? "high" : readinessScore >= 55 ? "medium" : "low";

  return {
    stats: {
      totalInterviews,
      totalSessions,
      avgScore,
      completedSessions: completedCount,
      readinessScore,
      hiringProbability,
      scoreDelta,
    },
    interviews: interviews.slice(0, 3),
    recentActivity,
    insights: {
      weakestTopic: weakestTopicEntry,
      retakeSuggestion: weakestSession
        ? {
            sessionId: weakestSession._id,
            title: weakestSession.title,
            focus: weakestSession.focus || "General Expertise",
            score: weakestSession.score,
            reason: `Your lowest recent session score is ${weakestSession.score}/100 in ${weakestSession.focus || weakestSession.title}.`,
          }
        : null,
    },
  };
};

export const deleteInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }
  if (interview.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this interview', 403);
  }
  
  await Session.deleteMany({ interviewId });
  await interview.deleteOne();
  return true;
};
