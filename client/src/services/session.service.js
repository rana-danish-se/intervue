import axiosInstance from '../lib/axiosInstance';

export const sessionService = {
  /**
   * POST /sessions/:id/generate-questions
   * Triggers the JIT LLM generation for a session's questions.
   */
  generateQuestions: async (sessionId) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/generate-questions`);
    return response.data;
  },

  /**
   * POST /sessions
   * Creates a manual custom session
   */
  createCustomSession: async (data) => {
    const response = await axiosInstance.post('/sessions', data);
    return response.data;
  },

  /**
   * PUT /sessions/reorder
   * Updates the order of multiple sessions
   * @param {Array<{id: string, order: number}>} updates 
   */
  reorderSessions: async (updates) => {
    const response = await axiosInstance.put('/sessions/reorder', { updates });
    return response.data;
  }
};

/**
 * Role: Session API Service Layer
 * What it has: Wrappers for session-specific endpoints.
 * Where it is being used: Consumed by the Pre-Session Lobby and SessionHistory for custom creations.
 */
