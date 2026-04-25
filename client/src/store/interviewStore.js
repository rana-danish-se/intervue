import { create } from 'zustand';

export const useInterviewStore = create((set) => ({
  interviews: [],
  isLoading: false,
  error: null,

  setInterviews: (interviews) =>
    set({ interviews, isLoading: false, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  addInterview: (interview) =>
    set((state) => ({ interviews: [interview, ...state.interviews] })),

  removeInterview: (id) =>
    set((state) => ({
      interviews: state.interviews.filter((i) => i._id !== id),
    })),
}));

/**
 * Role: Global Interview State Store
 * What it has:
 *   - interviews: array of interview documents fetched from the backend
 *   - isLoading: governs skeleton/loading UI
 *   - error: string error message to surface to the user
 *   - setInterviews: populate the list after a successful fetch
 *   - setLoading: toggle loading state
 *   - setError: store an error message and stop loading
 *   - clearError: dismiss the error
 *   - addInterview: optimistically prepend a new interview after creation
 *   - removeInterview: optimistically remove an interview after deletion
 * Where it is being used: Consumed by hooks/useInterviews.js and the interviews page.
 */
