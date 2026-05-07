"use client";

import { useEffect, useState } from "react";
import { interviewService } from "@/services/interview.service";

export function useDashboardSummary() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await interviewService.getDashboardSummary();
        if (active) setData(res);
      } catch (e) {
        if (active) setError(e.response?.data?.message || e.message || "Failed to load");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
