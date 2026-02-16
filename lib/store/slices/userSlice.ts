import { StateCreator } from 'zustand';
import { User } from '@/lib/graphql/users/types';
import { mapBackendUserToFrontendUser } from '@/lib/transformers';

export interface UserSlice {
  user: User | null;
  isAuthenticated: boolean;
  // Actions
  loginUser: (backendData: any) => void;
  setAuthenticatedUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logoutUser: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  loginUser: (backendData: any) => {
    // Transform data here, keeping the component clean
    const formattedUser = mapBackendUserToFrontendUser(backendData);
    set({ user: formattedUser, isAuthenticated: true });
  },
  setAuthenticatedUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  logoutUser: () => set({ user: null, isAuthenticated: false }),
});
