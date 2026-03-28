import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Feature from "@/components/Feature";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* GLOBAL GLOW EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <Navbar />
      <Hero />
      <Feature />
      <HowItWorks />
      <Pricing />
      <Dashboard />
      <Footer />
    </main>
  );
}
