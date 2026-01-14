import { StateCreator } from 'zustand';

// Placeholder types - extend as needed
export interface LeaveSlice {
  leaves: any[];
  leaveBalances: any[];
  setLeaves: (leaves: any[]) => void;
  setLeaveBalances: (balances: any[]) => void;
}

export const createLeaveSlice: StateCreator<LeaveSlice> = (set) => ({
  leaves: [],
  leaveBalances: [],
  setLeaves: (leaves) => set({ leaves }),
  setLeaveBalances: (balances) => set({ leaveBalances: balances }),
});
