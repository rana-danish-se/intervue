import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center  group">
      <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
        <Image 
          src="/logo.png" 
          alt="Intervue Logo" 
          width={271} 
          height={248} 
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="text-3xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors" style={{ fontFamily: "var(--font-syne)" }}>
        Intervue
      </span>
    </Link>
  );
}

/**
 * Role: Brand Logo UI Component
 * What it has: This is a pure UI component with no functions. It renders the Intervue logo image alongside the brand name text, wrapping both in a Next.js `<Link>` to the home route (`/`).
 * Where it is being used: Rendered inside `Navbar.jsx`, appearing in the top-left of all pages.
 */
