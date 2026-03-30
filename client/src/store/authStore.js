import { create } from 'zustand';

/**
 * useAuthStore
 * 
 * This is our global state container for Authentication. Any component in 
 * our entire Next.js app can simply say `const { user } = useAuthStore()` 
 * to instantly see who is logged in without passing Props down from layout.
 */
export const useAuthStore = create((set) => ({
  // ---- GLOBAL STATE ----
  user: null,               // Holds the profile details (name, email, avatar, etc.)
  isAuthenticated: false,   // Easily hide/show the "Login" or "Dashboard" buttons
  isLoading: true,          // Starts as true when the app boots up, while checking cookies

  // ---- ACTIONS ----
  
  // Call immediately after `authService.login()` or `authService.getMe()` succeeds
  setAuthData: (userData) => {
    set({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Call immediately after `authService.logout()` or if the refresh token completely expires
  clearAuthData: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  // Manual override for loading indicator
  setLoading: (status) => {
    set({ isLoading: status });
  }
}));
