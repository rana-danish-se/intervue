import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-border/50 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Intervue
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
          Sign In
        </Link>
        <Link href="/auth" className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]">
          Start Free Trial
        </Link>
      </div>
    </nav>
  );
}
