import { useState, useEffect } from "react";
import { interviewService } from "@/services/interview.service";

/**
 * Custom hook to fetch and manage the state of a single interview detail
 * @param {string} id - The ID of the interview to fetch
 */
export function useInterviewDetail(id) {
  const [interview, setInterview] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterview = async (showGlobalLoader = true) => {
    if (!id) return;
    try {
      if (showGlobalLoader) setLoading(true);
      setError(null);
      const data = await interviewService.getInterview(id);
      setInterview(data.interview);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch interview details.";
      setError(message);
    } finally {
      if (showGlobalLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview(true);
  }, [id]);

  return { interview, isLoading, error, refetch: fetchInterview };
}
