import { StateCreator } from 'zustand';

export type ColorAccent = 'indigo' | 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'slate';

export interface ThemeSlice {
    accent: ColorAccent;
    setAccent: (accent: ColorAccent) => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
    accent: 'indigo',
    setAccent: (accent) => set({ accent }),
});
