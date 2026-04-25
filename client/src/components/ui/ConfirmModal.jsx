"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warning, X } from "@phosphor-icons/react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  isDestructive = true,
  isLoading = false,
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-y-auto p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl"
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors disabled:opacity-50"
              >
                <X weight="bold" className="w-5 h-5" />
              </button>

              <div className="flex gap-4 mb-6">
                {isDestructive && (
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <Warning weight="fill" className="w-5 h-5 text-red-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{message}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isDestructive
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#A3E635] text-black hover:bg-[#94d82d]"
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
