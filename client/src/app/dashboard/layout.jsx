"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { CircleNotch } from "@phosphor-icons/react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <CircleNotch weight="bold" className="w-12 h-12 text-[#A3E635] animate-spin" />
      </div>
    );
  }

  const isInterviewRoom = pathname?.includes("/room");

  if (isInterviewRoom) {
    return <div className="h-screen bg-[#080808]">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] relative">
          {children}
        </main>
      </div>
    </div>
  );
}
