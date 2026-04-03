import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return <RegisterForm />;
}

/**
 * Role: Registration Page Router
 * What it has: 1 pure UI component
 * What it is doing: The `RegisterPage` function serves solely to wrap and render the `RegisterForm` client component for the layout router.
 * Where it is being used: Rendered when a user navigates to `/auth/register`.
 */
