import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

/**
 * Role: Global Axios HTTP Client with Token Refresh Interceptor
 * What it has: The response interceptor's error handler attempts a token refresh via `axios.post('/auth/refresh-token')` when a `401` is received on any request except `/auth/login`. If the refresh succeeds, it silently retries the original failed request via `axiosInstance(originalRequest)`. If the refresh also fails, it redirects to `/auth/login?session_expired=true`, but only when the user is outside of any `/auth/` route and not on the home page.
 * Where it is being used: Imported by `auth.service.js` as the sole HTTP client for all API requests.
 */
