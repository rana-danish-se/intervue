"use client";

import { useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export function useAuthInit() {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        setLoading(true);

        const responseData = await authService.getMe();

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

/**
 * Role: Auth Session Initializer Hook
 * What it has: `verifyUserSession` is an async function that calls `authService.getMe` to silently verify if the browser has valid HTTP-Only session cookies. On success, it calls `setAuthData` to populate the global auth store with the user profile. On failure (e.g. expired cookies or 401), it calls `clearAuthData` to reset the store. `setLoading` is toggled true at the start and false in the `finally` block to govern loading UI state.
 * Where it is being used: Called exclusively by `AuthHydrator.jsx`, which is mounted in `app/layout.js`.
 */
