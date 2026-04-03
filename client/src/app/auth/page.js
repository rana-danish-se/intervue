import { redirect } from "next/navigation";

export default function AuthPage() {
  redirect("/auth/login");
}

/**
 * Role: Authentication Route Redirector
 * What it has: 1 function
 * What it is doing: The `AuthPage` function executes an immediate client or server-side redirect, blindly forcing any traffic from `/auth` directly into `/auth/login`.
 * Where it is being used: Next.js hits this when a user attempts to visit the bare `/auth` URL.
 */
