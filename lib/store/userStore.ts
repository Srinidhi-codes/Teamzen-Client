import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GraphQLUser } from '@/lib/graphql/users/types';

interface UserState {
  user: GraphQLUser | null;
  isAuthenticated: boolean;
  setUser: (user: GraphQLUser) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<GraphQLUser>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
