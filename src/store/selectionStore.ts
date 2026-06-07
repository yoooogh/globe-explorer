import { create } from 'zustand';

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  height?: number;
  countryCode: string;
  countryName: string;
  placeName?: string;
}

interface SelectionState {
  selected: SelectedLocation | null;
  isPanelOpen: boolean;

  setSelected: (loc: SelectedLocation | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selected: null,
  isPanelOpen: false,

  setSelected: (loc) => set({ selected: loc, isPanelOpen: loc !== null }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  clearSelection: () => set({ selected: null, isPanelOpen: false }),
}));
