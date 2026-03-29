import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background flex flex-col selection:bg-primary/30">


      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-24 z-10 w-full min-h-[calc(100vh-80px)]">
        {children}
      </div>

      <Footer />
    </main>
  );
}
