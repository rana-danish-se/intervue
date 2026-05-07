/*
Role: Shared session/interview scoring utilities.
What it does: Centralizes per-question, per-session, and aggregate metric math used by controllers, services, and route responses.
Why it exists: Prevents scoring drift by keeping one scoring source of truth across dashboard, reports, and session detail endpoints.
*/

export const metricValuesFromStats = (stats = {}) =>
  [
    stats.confidence,
    stats.knowledgeLevel,
    stats.relevance,
    stats.fluency,
    stats.clarity,
  ].filter((value) => typeof value === "number");

export const scoreFromStats = (stats = {}) => {
  const values = metricValuesFromStats(stats);
  if (values.length === 0) return null;
  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
};

export const scoreQuestion = (question = {}) => scoreFromStats(question.stats || {});

export const scoreQuestions = (questions = []) => {
  const scores = questions.map(scoreQuestion).filter((value) => value !== null);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((acc, value) => acc + value, 0) / scores.length);
};

export const metricAveragesFromQuestions = (questions = []) => {
  const totals = { confidence: 0, knowledgeLevel: 0, relevance: 0, fluency: 0, clarity: 0 };
  let count = 0;
  for (const question of questions) {
    const stats = question?.stats || {};
    if (
      typeof stats.confidence === "number" &&
      typeof stats.knowledgeLevel === "number" &&
      typeof stats.relevance === "number" &&
      typeof stats.fluency === "number" &&
      typeof stats.clarity === "number"
    ) {
      totals.confidence += stats.confidence;
      totals.knowledgeLevel += stats.knowledgeLevel;
      totals.relevance += stats.relevance;
      totals.fluency += stats.fluency;
      totals.clarity += stats.clarity;
      count += 1;
    }
  }
  if (count === 0) return null;
  return {
    confidence: Math.round(totals.confidence / count),
    knowledgeLevel: Math.round(totals.knowledgeLevel / count),
    relevance: Math.round(totals.relevance / count),
    fluency: Math.round(totals.fluency / count),
    clarity: Math.round(totals.clarity / count),
  };
};
