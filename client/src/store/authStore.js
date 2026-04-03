import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuthData: (userData) => {
    set({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuthData: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  setLoading: (status) => {
    set({ isLoading: status });
  }
}));

/**
 * Role: Global Authentication State Store
 * What it has: `setAuthData` populates the store with the authenticated user's profile data and sets `isAuthenticated` to true — called after `authService.login()` or `authService.getMe()` succeeds. `clearAuthData` resets the user to null and `isAuthenticated` to false — called after `authService.logout()` or when the refresh token expires. `setLoading` manually toggles the `isLoading` flag to control loading indicators across pages.
 * Where it is being used: Consumed by `AuthHydrator.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`, `Navbar.jsx`, `Hero.jsx`, `CTA.jsx`, `DashboardPage`, and the `useAuthInit` hook.
 */
