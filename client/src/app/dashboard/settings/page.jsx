"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignOut, User, Sliders, CircleNotch } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { useToastStore } from "@/store/toastStore";
import Link from "next/link";

const STORAGE_KEY = "intervue-user-settings";

function loadSettings() {
  if (typeof window === "undefined") return { defaultDifficulty: "medium", preferTypedAnswers: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { defaultDifficulty: "medium", preferTypedAnswers: false };
    const parsed = JSON.parse(raw);
    return {
      defaultDifficulty: parsed.defaultDifficulty || "medium",
      preferTypedAnswers: !!parsed.preferTypedAnswers,
    };
  } catch {
    return { defaultDifficulty: "medium", preferTypedAnswers: false };
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuthData } = useAuthStore();
  const showToast = useToastStore((s) => s.showToast);
  const [settings, setSettings] = useState({ defaultDifficulty: "medium", preferTypedAnswers: false });
  const [hydrated, setHydrated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      showToast("Could not reach server; signed out locally.", "info");
    } finally {
      clearAuthData();
      router.push("/auth/login");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-white/50 text-sm mb-10">Account and interview preferences.</p>

      <section className="rounded-2xl bg-[#111111] border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 text-[#A3E635]">
          <User className="w-5 h-5" weight="bold" />
          <h2 className="text-lg font-bold text-white">Profile</h2>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-white/50">Name</span>
            <span className="text-white ml-3">{user?.name || "—"}</span>
          </p>
          <p>
            <span className="text-white/50">Email</span>
            <span className="text-white ml-3">{user?.email || "—"}</span>
          </p>
          <p>
            <span className="text-white/50">Plan</span>
            <span className="text-white ml-3 capitalize">{user?.plan || "free"}</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-[#111111] border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 text-[#A3E635]">
          <Sliders className="w-5 h-5" weight="bold" />
          <h2 className="text-lg font-bold text-white">Interview preferences</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Default question difficulty
            </label>
            <select
              value={settings.defaultDifficulty}
              onChange={(e) => setSettings((s) => ({ ...s, defaultDifficulty: e.target.value }))}
              className="w-full max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <p className="text-xs text-white/40 mt-2">
              Used when starting a new session from the session detail page (you can still change it per session).
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.preferTypedAnswers}
              onChange={(e) => setSettings((s) => ({ ...s, preferTypedAnswers: e.target.checked }))}
              className="rounded border-white/20 bg-black/50 text-[#A3E635] focus:ring-[#A3E635]"
            />
            <span className="text-sm text-white/80">Prefer typing answers in the live room (falls back if voice is unavailable)</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-[#111111] border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Security</h2>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-[#A3E635] hover:underline"
        >
          Reset password via email
        </Link>
      </section>

      <div className="mt-10">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition-colors disabled:opacity-60"
        >
          {loggingOut ? <CircleNotch className="w-5 h-5 animate-spin" /> : <SignOut className="w-5 h-5" />}
          Sign out
        </button>
      </div>
    </div>
  );
}
