import axiosInstance from '../lib/axiosInstance';

/**
 * auth.service.js
 * 
 * This file encapsulates all the API calls related to authentication.
 * By keeping them separated from React components, our code remains 
 * extremely clean, reusable, and easy to test.
 */

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Verify email via secure token
   */
  verifyEmail: async (token) => {
    // Note: The backend route is still /api/auth/verify-email/:token
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  /**
   * Login an existing user
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get the current user's profile
   * Uses the automatically attached HTTP-Only browser cookies!
   */
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  /**
   * Logout the user
   * Instructs the backend to destroy the HTTP-Only cookies.
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
};
