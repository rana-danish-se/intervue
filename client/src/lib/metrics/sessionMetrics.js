/*
Role: Shared client-side session scoring helpers.
What it does: Normalizes question stats and computes per-question/per-session averages used across reports and progress views.
Where used: Imported by session/report UI components to avoid duplicate score math.
Why it exists: Keeps frontend score presentation consistent with a single reusable utility.
*/

export const scoreFromStats = (stats) => {
  if (!stats) return null;
  const values = [
    stats.confidence,
    stats.knowledgeLevel,
    stats.relevance,
    stats.fluency,
    stats.clarity,
  ].filter((value) => typeof value === "number");
  if (values.length === 0) return null;
  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
};

export const averageScoreFromQuestions = (questions = []) => {
  const scores = questions
    .map((question) => scoreFromStats(question?.stats))
    .filter((value) => typeof value === "number");
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((acc, value) => acc + value, 0) / scores.length);
};
