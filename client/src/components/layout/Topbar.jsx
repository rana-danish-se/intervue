"use client";

import { Bell, Question, MagnifyingGlass, User } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 group-focus-within:text-[#A3E635] transition-colors" />
          <input 
            type="text" 
            placeholder="Search sessions..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#A3E635]/50 focus:bg-white/10 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4">
        <div className="hidden md:flex items-center gap-3">
          <span className="px-3 py-1 rounded border border-white/20 text-xs font-semibold text-white/80">Pro Plan</span>
        </div>

        <div className="flex items-center gap-3 border-r border-white/10 pr-6">
          <button className="text-white/60 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#A3E635] rounded-full border border-black"></span>
          </button>
          <button className="text-white/60 hover:text-white transition-colors">
            <Question className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-white">{user?.name || "Alex Rivers"}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">{user?.role || "Product Lead"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white/70" weight="fill" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
