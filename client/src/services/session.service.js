import axiosInstance from '../lib/axiosInstance';

export const sessionService = {
  /**
   * POST /sessions/:id/generate-questions
   * Generates questions if not already generated, marks session as in-progress,
   * and returns the questions array for the live room to use.
   */
  startAndFetchQuestions: async (sessionId) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/generate-questions`);
    return response.data; // { success, questions: [{_id, questionText}] }
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
   */
  reorderSessions: async (updates) => {
    const response = await axiosInstance.put('/sessions/reorder', { updates });
    return response.data;
  },

  /**
   * PATCH /sessions/:id/abandon
   * Marks the session as abandoned
   */
  abandonSession: async (sessionId) => {
    const response = await axiosInstance.patch(`/sessions/${sessionId}/abandon`);
    return response.data;
  },

  /**
   * POST /sessions/:id/complete
   * Saves all user answers and marks the session as completed
   */
  completeSession: async (sessionId, answers) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/complete`, { answers });
    return response.data;
  }
};

/**
 * Role: Session API Service Layer
 * What it has: Wrappers for session-specific endpoints.
 * Where it is being used: Consumed by the room and session history components.
 */
