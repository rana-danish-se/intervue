"use client";

import { useState, useEffect, useRef } from "react";
import { Funnel, CaretRight, Plus, Brain, Play, DotsSixVertical, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { Reorder } from "framer-motion";
import { sessionService } from "@/services/session.service";
import { useToastStore } from "@/store/toastStore";
import CustomSessionModal from "./CustomSessionModal";

export default function SessionHistory({ interviewId, sessions: initialSessions = [], refetch }) {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  // Sync with props but sort by order
  useEffect(() => {
    if (initialSessions) {
      setSessions([...initialSessions].sort((a, b) => a.order - b.order));
    }
  }, [initialSessions]);

  const debounceTimerRef = useRef(null);

  const handleReorder = (newOrder) => {
    // Optimistically update local UI
    setSessions(newOrder);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the backend request by 1 second
    debounceTimerRef.current = setTimeout(async () => {
      setIsTableLoading(true);
      const updates = newOrder.map((session, index) => ({
        id: session._id,
        order: index + 1
      }));

      try {
        await sessionService.reorderSessions(updates);
        if (refetch) await refetch(false);
      } catch (error) {
        console.error(error);
        showToast("Failed to save session order", "error");
        if (refetch) await refetch(false); // revert on failure
      } finally {
        setIsTableLoading(false);
      }
    }, 1000);
  };

  const handleModalSuccess = async () => {
    if (refetch) {
      setIsTableLoading(true);
      await refetch(false);
      setIsTableLoading(false);
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white tracking-tight mb-4">Sessions</h2>
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <Brain className="w-12 h-12 text-white/20 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Sessions Found</h3>
          <p className="text-white/50 text-sm mb-6 max-w-sm">
            It looks like we could not generate sessions for this interview, or they were deleted.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Session
          </button>
        </div>
        
        <CustomSessionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          interviewId={interviewId}
          onSuccess={handleModalSuccess}
        />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Interview Sessions</h2>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg bg-[#111111] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors" title="Filter Sessions">
            <Funnel className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden relative">
        {/* Table Head */}
        <div className="grid grid-cols-12 border-b border-white/5 px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-wider gap-4 pl-12">
          <div className="col-span-1">Order</div>
          <div className="col-span-4">Session Title</div>
          <div className="col-span-4">Focus Area</div>
          <div className="col-span-1">Questions</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Draggable Table Body */}
        <Reorder.Group axis="y" values={sessions} onReorder={handleReorder} className="flex flex-col">
          {sessions.map((session, i) => {
            const isPending = session.status === 'pending';
            const isInProgress = session.status === 'in-progress';
            
            return (
              <Reorder.Item 
                key={session._id} 
                value={session}
                className="relative bg-[#111111] cursor-grab active:cursor-grabbing"
              >
                <div
                  className={`grid grid-cols-12 items-center gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors relative group ${
                    i !== sessions.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors">
                    <DotsSixVertical className="w-5 h-5" />
                  </div>

                  <div className="col-span-1 text-sm font-bold text-white pl-6">#{i + 1}</div>
                  <div className="col-span-4 text-sm font-medium text-white truncate pr-4" title={session.title}>
                    {session.title}
                  </div>
                  <div className="col-span-4 text-[13px] text-white/60 truncate pr-4" title={session.focus || "General"}>
                    {session.focus || "General"}
                  </div>
                  <div className="col-span-1 text-sm text-white/60">
                    {session.questions?.length || 0}
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-white/80 capitalize">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isPending ? 'bg-orange-400' : 
                        session.status === 'abandoned' ? 'bg-red-400' : 
                        session.status === 'completed' ? 'bg-[#A3E635]' : 'bg-blue-400'
                      }`}></span>
                      {session.status}
                    </div>
                    
                    {isPending ? (
                      <Link
                        href={`/dashboard/sessions/${session._id}`}
                        className="text-[11px] font-bold px-3 py-1.5 bg-[#A3E635] text-black hover:bg-[#94d82d] rounded flex items-center gap-1 transition-colors"
                      >
                        <Play weight="fill" className="w-3 h-3" /> Start
                      </Link>
                    ) : isInProgress ? (
                      <Link
                        href={`/dashboard/sessions/${session._id}`}
                        className="text-[11px] font-bold px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded flex items-center gap-1 transition-colors"
                      >
                        Continue <CaretRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link 
                        href={`/dashboard/sessions/${session._id}`}
                        className="text-[11px] font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
                      >
                        View <CaretRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 border-t border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Custom Session
        </button>

        {isTableLoading && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-[#111111] border border-white/10 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <CircleNotch className="w-4 h-4 text-[#A3E635] animate-spin" />
              <span className="text-xs font-bold text-white/80">Syncing...</span>
            </div>
          </div>
        )}
      </div>

      <CustomSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        interviewId={interviewId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
