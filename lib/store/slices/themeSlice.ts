import { StateCreator } from 'zustand';

export type ColorAccent = 'teal' | 'slate' | 'blue' | 'green' | 'indigo' | 'orange' | 'red' | 'purple';

export interface ThemeSlice {
    accent: ColorAccent;
    setAccent: (accent: ColorAccent) => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
    accent: 'teal',
    setAccent: (accent) => set({ accent }),
});
