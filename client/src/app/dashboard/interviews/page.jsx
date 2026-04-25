"use client";

import { useState } from "react";
import { useInterviews } from "@/hooks/useInterviews";
import { useInterviewStore } from "@/store/interviewStore";
import { useToastStore } from "@/store/toastStore";
import { interviewService } from "@/services/interview.service";

import InterviewsHeader from "@/components/interviews/InterviewsHeader";
import InterviewsFilters from "@/components/interviews/InterviewsFilters";
import InterviewCard from "@/components/interviews/InterviewCard";
import InterviewCardSkeleton from "@/components/interviews/InterviewCardSkeleton";
import InterviewsEmpty from "@/components/interviews/InterviewsEmpty";
import InterviewsCta from "@/components/interviews/InterviewsCta";
import ConfirmModal from "@/components/ui/ConfirmModal";

// ─── Filter helpers ────────────────────────────────────────────────────────────

const LEVEL_ROLES = {
  JUNIOR: "junior",
  MID: "mid",
  SENIOR: "senior",
};

function applyFilters(interviews, activeStatus, roleFilter) {
  // Status filter is placeholder until sessions data exists
  let result = [...interviews];
  if (roleFilter && roleFilter !== "all") {
    result = result.filter((i) => i.experienceLevel === roleFilter);
  }
  return result;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyInterviews() {
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [roleFilter] = useState("all"); // expandable once role-select dropdown is wired
  const [deletingId, setDeletingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Data layer
  const { interviews, isLoading, error } = useInterviews();
  const removeInterview = useInterviewStore((state) => state.removeInterview);
  const showToast = useToastStore((state) => state.showToast);

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDeleteRequest = (id) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeletingId(itemToDelete);
      await interviewService.deleteInterview(itemToDelete);
      removeInterview(itemToDelete); // optimistic remove from store
      showToast("Interview deleted successfully", "success");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete interview.";
      showToast(message, "error");
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const filtered = applyFilters(interviews, activeStatus, roleFilter);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <InterviewsHeader />

      <InterviewsFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      {/* Error banner */}
      {error && !isLoading && (
        <div className="mb-8 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Interview grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {isLoading ? (
          // Loading skeletons — show 4 placeholder cards
          Array.from({ length: 4 }).map((_, i) => (
            <InterviewCardSkeleton key={i} />
          ))
        ) : filtered.length === 0 ? (
          <InterviewsEmpty />
        ) : (
          filtered.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              onDelete={handleDeleteRequest}
              isDeleting={deletingId === interview._id}
            />
          ))
        )}
      </div>

      <InterviewsCta />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Interview"
        message="Are you sure you want to delete this interview? This action cannot be undone and you will lose all associated data."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onClose={() => !deletingId && setItemToDelete(null)}
        isLoading={!!deletingId}
      />
    </div>
  );
}
