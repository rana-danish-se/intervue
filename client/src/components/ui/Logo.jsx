import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center  group">
      <div className="relative w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-105">
        <Image 
          src="/logo.png" 
          alt="Intervue Logo" 
          width={271} 
          height={248} 
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="text-4xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors" style={{ fontFamily: "var(--font-syne)" }}>
        Intervue
      </span>
    </Link>
  );
}
