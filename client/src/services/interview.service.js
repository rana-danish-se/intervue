/*
Role: Interview API client service.
What it does: Encapsulates `/interviews` and dashboard-summary requests for list/detail/create/delete flows.
Where used: Consumed by interview/dashboard hooks and pages.
Why it exists: Provides a single source of frontend-backend contract definitions for interview resources.
*/

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
  getDashboardSummary: async () => {
    const response = await axiosInstance.get('/interviews/dashboard/summary');
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

