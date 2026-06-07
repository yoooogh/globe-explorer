import { create } from 'zustand';
import type { GeocodeResult } from '../types/geocode';

interface SearchState {
  query: string;
  results: GeocodeResult[];
  isSearching: boolean;
  error: string | null;

  setQuery: (q: string) => void;
  setResults: (r: GeocodeResult[]) => void;
  setIsSearching: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isSearching: false,
  error: null,

  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r, isSearching: false }),
  setIsSearching: (v) => set({ isSearching: v }),
  setError: (e) => set({ error: e, isSearching: false }),
  clearSearch: () => set({ query: '', results: [], isSearching: false, error: null }),
}));
