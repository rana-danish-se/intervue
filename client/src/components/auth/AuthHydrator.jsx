"use client";

import { useAuthInit } from "@/hooks/useAuthInit";

/**
 * AuthHydrator
 * 
 * A silent, invisible Client Component whose sole purpose is to execute
 * the `useAuthInit` hook globally across the Next.js application without
 * accidentally forcing the RootLayout out of Server Component mode.
 */
export default function AuthHydrator() {
  useAuthInit();
  return null;
}
