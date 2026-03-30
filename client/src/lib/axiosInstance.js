import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a globally configured Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- AXIOS INTERCEPTOR LOGIC ---
// We intercept all responses from the backend before they reach your React components.
axiosInstance.interceptors.response.use(
  (response) => {
    // If the request succeeds (status 20x), just return the data normally.
    return response;
  },
  async (error) => {
    // If the request fails, we grab the configuration of the exact request that failed.
    const originalRequest = error.config;

    // Is the error a 401 Unauthorized? (Meaning the 15-minute Access Token died)
    // And have we NOT already attempted to retry this specific request?
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request so we don't accidentally fall into an infinite error loop
      originalRequest._retry = true;

      try {
        // Because the access token died, we immediately ask the server for a new one.
        // Note: We use base `axios` here instead of `axiosInstance` so our refresh 
        // attempt doesn't get trapped in this exact same interceptor logic!
        await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true } // Crucial: send the refresh cookie
        );

        // Success! The server automatically replaced our broken cookies with fresh ones.
        // Now, we silently retry the original request that failed.
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Completely failed. The user's 7-day Refresh Token also expired.
        // We only forcibly redirect if they aren't on the Home page and it wasn't a silent check.
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/' && 
            !originalRequest.url.includes('/auth/me')) {
          window.location.href = '/auth/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    // For all other errors (404 Not Found, 500 Server Error), just pass it down
    // so React Query or your component can handle it (like showing an error toast).
    return Promise.reject(error);
  }
);

export default axiosInstance;
