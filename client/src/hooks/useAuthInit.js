"use client";

import { useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

/**
 * useAuthInit
 * 
 * This custom hook runs exactly once when your Next.js application first loads
 * or when the user manually hits the browser "Refresh" button. 
 * Its only job is to silently ask the backend, "Do I still have valid login cookies?"
 * and then hydrate the Zustand Store.
 */
export function useAuthInit() {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        // Instantly mark the app as "Loading" so we don't accidentally show Login buttons
        // while we are secretly checking the cookies in the background.
        setLoading(true);

        // Call our API Service (which uses Axios configured with withCredentials: true!)
        const responseData = await authService.getMe();

        // If the backend didn't throw a 401 error, our cookies are valid!
        if (responseData && responseData.user) {
          setAuthData(responseData.user);
        } else {
          clearAuthData();
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, [setAuthData, clearAuthData, setLoading]);
}
