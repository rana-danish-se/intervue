"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignOut, User, CircleNotch, Lightning } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";

export default function DashboardPage() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading, clearAuthData } = useAuthStore();


  useEffect(() => {

    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {

      await authService.logout();

      clearAuthData();

      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };


  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />


      <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User weight="fill" className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              {user?.name || "Guest User"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 transition-all text-sm font-semibold group"
        >
          <SignOut weight="bold" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </button>
      </header>


      <main className="max-w-6xl mx-auto mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >

          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Welcome to your Workspace
          </h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-2xl">
            You successfully logged in! Your secure backend cookies are active, and Zustand successfully retrieved your profile flawlessly across reloads.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            

            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">Current Plan</h3>
                <Lightning weight="fill" className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold text-white capitalize">{user?.plan || 'Free'} Tier</p>
            </div>
            

            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">Account Status</h3>
              </div>
              <div className="flex items-center gap-3 text-lg font-bold text-green-400">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                Verified & Active
              </div>
            </div>


            <div className="p-7 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">User ID</h3>
              </div>
              <p className="text-sm font-mono text-muted-foreground break-all">{user?.id}</p>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}

/**
 * Role: Protected Dashboard Interface
 * What it has: 2 functions
 * What it is doing: The `handleLogout` function clears local Zustand state and sends a logout ping to securely destroy HTTP cookies on the server before redirecting to login. The `DashboardPage` component acts as a protected route shell, evaluating the auth state synchronously and rendering the authenticated user's workspace UI elements (avatar, tier, status) while intercepting unauthorized users.
 * Where it is being used: Mounted at `/dashboard` strictly for authenticated sessions.
 */
