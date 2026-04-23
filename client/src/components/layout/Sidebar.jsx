"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  ChatTeardropText, 
  ChartBar, 
  Gear, 
  Plus 
} from "@phosphor-icons/react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { name: "My Interviews", href: "/dashboard/interviews", icon: ChatTeardropText },
  { name: "Progress", href: "/dashboard/progress", icon: ChartBar },
  { name: "Settings", href: "/dashboard/settings", icon: Gear },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col min-h-screen text-white fixed left-0 top-0 bottom-0 z-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#A3E635] flex items-center gap-2 tracking-tight">
          <ChatTeardropText weight="fill" className="text-[#A3E635]" />
          Rovoxa
        </h1>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 ml-8">AI Interview Prep</p>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? "bg-[#A3E635]/10 text-[#A3E635] border-l-2 border-[#A3E635]" 
                  : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <item.icon weight={isActive ? "fill" : "regular"} className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-white/10">
        <Link 
          href="/dashboard/interviews/create"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors"
        >
          <Plus weight="bold" className="w-4 h-4" />
          Create New
        </Link>
      </div>
    </aside>
  );
}
