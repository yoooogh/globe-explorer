import { create } from 'zustand';
import type { Breakpoint, PanelTab } from '../types/ui';

interface UIState {
  breakpoint: Breakpoint;
  activeTab: PanelTab;
  isSearchFocused: boolean;

  setBreakpoint: (bp: Breakpoint) => void;
  setActiveTab: (tab: PanelTab) => void;
  setSearchFocused: (f: boolean) => void;
}

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export const useUIStore = create<UIState>((set) => ({
  breakpoint: getBreakpoint(),
  activeTab: 'ai',
  isSearchFocused: false,

  setBreakpoint: (bp) => set({ breakpoint: bp }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchFocused: (f) => set({ isSearchFocused: f }),
}));
