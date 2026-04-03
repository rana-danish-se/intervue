import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}

/**
 * Role: Login Page Router
 * What it has: 1 pure UI component
 * What it is doing: The `LoginPage` function strictly serves as a Next.js server route that imports and returns the comprehensive `LoginForm` client component.
 * Where it is being used: Loaded when a user accesses `/auth/login`.
 */
