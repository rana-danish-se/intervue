"use client";

import { useEffect } from 'react';
import { interviewService } from '../services/interview.service';
import { useInterviewStore } from '../store/interviewStore';
import { useToastStore } from '../store/toastStore';

/**
 * useInterviews
 *
 * Fetches the authenticated user's interviews on mount, populates
 * the global interviewStore, and surfaces loading / error state.
 * Re-fetches only once per mount — the store acts as the cache.
 */
export function useInterviews() {
  const { interviews, isLoading, error, setInterviews, setLoading, setError } =
    useInterviewStore();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getInterviews();
        setInterviews(data.interviews ?? []);
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to load interviews. Please try again.';
        setError(message);
        showToast(message, 'error');
      }
    };

    fetchInterviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { interviews, isLoading, error };
}

/**
 * Role: Interview Data Fetching Hook
 * What it has: Calls interviewService.getInterviews() on mount and pipes
 *   the result into interviewStore via setInterviews. Skips the fetch if
 *   interviews are already cached in the store. On error, sets the error
 *   state in the store and fires a toast notification.
 * Where it is being used: app/dashboard/interviews/page.jsx
 */
