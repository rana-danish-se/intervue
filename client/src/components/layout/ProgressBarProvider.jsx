"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function ProgressBarProvider({ children }) {
  return (
    <>
      <ProgressBar
        height="3px"
        color="#a3e635"
        options={{ showSpinner: false, speed: 400, minimum: 0.1 }}
        shallowRouting
      />
      {children}
    </>
  );
}

/**
 * Role: Global Navigation Progress Bar Provider
 * What it has: This is a pure UI provider component with no custom functions. It wraps the application in the `AppProgressBar` from `next-nprogress-bar`, which displays an animated thin bar at the top of the browser during Next.js client-side route transitions.
 * Where it is being used: Wraps the entire app inside `app/layout.js`, applying the progress bar globally to every page transition.
 */
