import { create } from 'zustand';
import { User, UserRole } from '@/types/user';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;

  // Computed
  isAdmin: () => boolean;
  isGuest: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
  })),

  clearUser: () => set({ user: null, error: null }),

  isAdmin: () => get().user?.role === UserRole.ADMIN,

  isGuest: () => get().user?.role === UserRole.GUEST,
}));
