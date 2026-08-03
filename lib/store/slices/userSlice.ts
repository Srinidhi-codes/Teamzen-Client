import { StateCreator } from 'zustand';
import { GraphQLUser } from '@/lib/graphql/users/types';
import { mapBackendUserToFrontendUser } from '@/lib/transformers';
import { ColorAccent } from './themeSlice';

const VALID_ACCENTS: ColorAccent[] = [
  'teal', 'slate', 'blue', 'green', 'indigo', 'orange', 'red', 'purple',
];

function normalizeAccent(value?: string | null): ColorAccent {
  if (value && VALID_ACCENTS.includes(value as ColorAccent)) {
    return value as ColorAccent;
  }
  return 'teal';
}

export interface UserSlice {
  user: GraphQLUser | null;
  isAuthenticated: boolean;
  // Actions
  loginUser: (backendData: any) => void;
  setAuthenticatedUser: (user: GraphQLUser) => void;
  updateUser: (updates: Partial<GraphQLUser>) => void;
  logoutUser: () => void;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  loginUser: (backendData: any) => {
    const formattedUser = mapBackendUserToFrontendUser(backendData);
    const accent = normalizeAccent(formattedUser.organization?.accent);
    set({
      user: formattedUser,
      isAuthenticated: true,
      accent,
    } as Partial<UserSlice> as UserSlice);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accent);
    }
  },
  setAuthenticatedUser: (user: GraphQLUser) => {
    const accent = normalizeAccent(user.organization?.accent);
    set({
      user,
      isAuthenticated: true,
      ...(user.organization?.accent ? { accent } : {}),
    } as Partial<UserSlice> as UserSlice);
    if (user.organization?.accent && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accent);
    }
  },
  updateUser: (updates: Partial<GraphQLUser>) =>
    set((state) => {
      const nextUser = state.user
        ? {
            ...state.user,
            ...updates,
            organization: updates.organization
              ? { ...(state.user.organization as any), ...updates.organization }
              : state.user.organization,
          }
        : null;
      const orgAccent = updates.organization?.accent;
      if (orgAccent && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-accent', normalizeAccent(orgAccent));
      }
      return {
        user: nextUser,
        ...(orgAccent ? { accent: normalizeAccent(orgAccent) } : {}),
      } as Partial<UserSlice> as UserSlice;
    }),
  logoutUser: () => set({ user: null, isAuthenticated: false }),
});
