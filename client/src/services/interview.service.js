import axiosInstance from '../lib/axiosInstance';

export const interviewService = {
  /**
   * GET /interviews — fetch all interviews for the authenticated user.
   * Returns { success, count, interviews }
   */
  getInterviews: async () => {
    const response = await axiosInstance.get('/interviews');
    return response.data;
  },

  /**
   * GET /interviews/:id — fetch a single interview by ID (ownership-checked by server).
   * Returns { success, interview }
   */
  getInterview: async (id) => {
    const response = await axiosInstance.get(`/interviews/${id}`);
    return response.data;
  },

  /**
   * POST /interviews — create a new interview for the authenticated user.
   * Returns { success, interview }
   */
  createInterview: async (data) => {
    const response = await axiosInstance.post('/interviews', data);
    return response.data;
  },

  /**
   * DELETE /interviews/:id — delete an interview (ownership-checked by server).
   * Returns { success, message }
   */
  deleteInterview: async (id) => {
    const response = await axiosInstance.delete(`/interviews/${id}`);
    return response.data;
  },
};

/**
 * Role: Interview API Service Layer
 * What it has: Thin wrappers over axiosInstance for all /interviews endpoints.
 *   - getInterviews: fetch all interviews belonging to the logged-in user
 *   - getInterview: fetch a single interview by ID
 *   - createInterview: POST a new interview document
 *   - deleteInterview: DELETE an interview by ID
 * Where it is being used: Imported by hooks/useInterviews.js.
 */
