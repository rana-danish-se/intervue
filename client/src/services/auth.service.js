import axiosInstance from '../lib/axiosInstance';



export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
    return response.data;
  },
};

/**
 * Role: Authentication API Service Layer
 * What it has: `register` creates a new user account by posting name, email, and password to the backend. `verifyEmail` confirms a user's email using the URL token from the verification email. `login` authenticates a user with email and password and returns a session. `getMe` fetches the currently logged-in user's profile using the browser's HTTP-Only cookies. `logout` tells the backend to destroy the active session cookies. `forgotPassword` dispatches a password reset email to the given address. `resetPassword` posts a new password to the backend using the secure token from the reset email link.
 * Where it is being used: Imported by `hooks/useAuthInit.js`, `components/auth/LoginForm.jsx`, `components/auth/RegisterForm.jsx`, `app/auth/forgot-password/page.jsx`, `app/auth/reset-password/[token]/page.jsx`, `app/auth/verify/[token]/page.jsx`, and `app/dashboard/page.jsx`.
 */
