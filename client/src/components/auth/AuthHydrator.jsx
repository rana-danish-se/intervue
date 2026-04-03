"use client";

import { useAuthInit } from "@/hooks/useAuthInit";

export default function AuthHydrator() {
  useAuthInit();
  return null;
}

/**
 * Role: Global Auth Session Bootstrapper
 * What it has: `AuthHydrator` is a silent, renderless client component that calls `useAuthInit` to trigger a background authentication session check on every full app load.
 * Where it is being used: Mounted inside `app/layout.js` inside the `<ProgressBarProvider>`, ensuring the auth state is hydrated before any page renders.
 */
