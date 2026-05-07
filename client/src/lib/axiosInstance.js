/*
Role: Shared HTTP client for frontend API calls.
What it does: Configures axios base URL/credentials and handles transparent access-token refresh + safe login redirect on auth expiry.
Where used: Imported by client service modules as the default API transport.
Why it exists: Enforces consistent request/response behavior and avoids duplicated auth-retry logic.
*/

import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/' &&
            !window.location.pathname.startsWith('/auth/') && 
            !originalRequest.url.includes('/auth/me')) {
          window.location.href = '/auth/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
