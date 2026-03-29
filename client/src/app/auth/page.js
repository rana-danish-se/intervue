import AuthForm from "@/components/AuthForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthPage() {
  return (
    <main className="relative min-h-screen bg-background flex flex-col selection:bg-primary/30">
      {/* GLOBAL GLOW EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 pb-24 z-10">
        <AuthForm />
      </div>

      <Footer />
    </main>
  );
}
