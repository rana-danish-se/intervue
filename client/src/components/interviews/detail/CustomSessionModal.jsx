"use client";

import { useState } from "react";
import { X, CircleNotch } from "@phosphor-icons/react";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";

export default function CustomSessionModal({ isOpen, onClose, interviewId, onSuccess }) {
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await sessionService.createCustomSession({ interviewId, title, focus, difficulty });
      showToast("Custom session created successfully", "success");
      onSuccess();
      setTitle("");
      setFocus("");
      setDifficulty("medium");
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to create session", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">Add Custom Session</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Deep Dive"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70">Focus Area (Optional)</label>
            <input 
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Hooks, Context API, and Performance"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635] transition-all"
            />
            <p className="text-xs text-white/40">The AI will use this focus area to generate exactly 5 relevant questions.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70">Difficulty</label>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635] transition-all"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#A3E635] text-black hover:bg-[#94d82d] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
