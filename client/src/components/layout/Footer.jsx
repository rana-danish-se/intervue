export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 py-8 px-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Intervue. Built to talk. Trained to understand.
    </footer>
  );
}

/**
 * Role: Global Page Footer
 * What it has: This is a pure UI component with no functions. It renders a simple static footer bar with the dynamic copyright year and the brand tagline.
 * Where it is being used: Rendered at the bottom of `pages/Home.jsx` (landing page) and `app/auth/layout.tsx` (all authentication route pages).
 */
