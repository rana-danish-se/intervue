import { create } from 'zustand';

export const useToastStore = create((set) => ({
  message: null,
  type: 'success',
  isVisible: false,
  duration: 4000,
  timeoutId: null,

  showToast: (message, type = 'success', duration = 4000) => {
    set((state) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }

      const timeoutId = setTimeout(() => {
        set({ isVisible: false });
      }, duration);

      return {
        message,
        type,
        isVisible: true,
        duration,
        timeoutId,
      };
    });
  },

  hideToast: () => set({ isVisible: false }),
}));

/**
 * Role: Global Toast Notification State Store
 * What it has: `showToast` accepts a message string, a type (`success`, `warning`, `error`, or `info`), and an optional duration. It clears any running auto-hide timer, sets the new toast state to visible, and schedules a new timeout to auto-dismiss. `hideToast` immediately sets `isVisible` to false, dismissing the toast when the user clicks the close button.
 * Where it is being used: `showToast` is called from `LoginForm.jsx`, `ForgotPasswordPage`, and `ResetPasswordPage`. `hideToast` is called by the `Toast.jsx` UI component's close button.
 */
