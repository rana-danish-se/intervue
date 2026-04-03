import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background flex flex-col selection:bg-primary/30">

      <Toast />

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-24 z-10 w-full min-h-[calc(100vh-80px)]">
        {children}
      </div>

      <Footer />
    </main>
  );
}

/**
 * Role: Authentication Module Layout
 * What it has: 1 pure UI component
 * What it is doing: The `AuthLayout` function acts as a wrapper for all internal authentication routes. It renders the global `Navbar`, `Toast` notifications, and `Footer`, while centering the currently active child route.
 * Where it is being used: Next.js applies this layout structure to all routes under `/auth/*`.
 */
