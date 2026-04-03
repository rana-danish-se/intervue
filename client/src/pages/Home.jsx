import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import ProblemStatement from "@/components/landing/ProblemStatement";
import HowItWorks from "@/components/landing/HowItWorks";
import Feature from "@/components/landing/Feature";
import DemoPreview from "@/components/landing/DemoPreview";
import Domains from "@/components/landing/Domains";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <div className="fixed top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/30 blur-[150px] pointer-events-none mix-blend-screen z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-[150px] pointer-events-none mix-blend-screen z-0" />

      <Navbar />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <Feature />
      <DemoPreview />
      <Domains />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

/**
 * Role: Landing Page Assembly Component
 * What it has: This is a pure UI component with no functions. It composes and renders the full landing page by assembling all section components in order: `Navbar`, `Hero`, `ProblemStatement`, `HowItWorks`, `Feature`, `DemoPreview`, `Domains`, `Testimonials`, `Pricing`, `CTA`, and `Footer`.
 * Where it is being used: Imported and rendered by `app/page.js` at the root `/` route.
 */
