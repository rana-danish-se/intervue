"use client";

import Link from "next/link";
import { User, Gear } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Dashboard</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Gear className="w-4 h-4" />
          Settings
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="hidden sm:block text-right min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[160px]">{user?.name || "Account"}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider truncate max-w-[160px]">
              {user?.email || ""}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white/70" weight="fill" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
