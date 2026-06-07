import { create } from 'zustand';
import type { WikiSummary, Attraction } from '../types/wiki';
import { WIKI_CACHE_TTL } from '../utils/constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface WikiState {
  summaryCache: Record<string, CacheEntry<WikiSummary>>;
  attractionsCache: Record<string, CacheEntry<Attraction[]>>;
  isLoading: boolean;
  error: string | null;

  fetchSummary: (title: string, lang?: string) => Promise<void>;
  fetchAttractions: (lat: number, lon: number) => Promise<void>;
}

export const useWikiStore = create<WikiState>((set, get) => ({
  summaryCache: {},
  attractionsCache: {},
  isLoading: false,
  error: null,

  fetchSummary: async (title: string, lang = 'zh') => {
    const cached = get().summaryCache[title];
    if (cached && Date.now() - cached.timestamp < WIKI_CACHE_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const { fetchSummary } = await import('../services/api/wikipedia');
      const data = await fetchSummary(title, lang);
      const newCache = { ...get().summaryCache };
      newCache[title] = { data, timestamp: Date.now() };
      set({ summaryCache: newCache, isLoading: false });
    } catch (e) {
      // Try English fallback
      if (lang !== 'en') {
        try {
          const { fetchSummary } = await import('../services/api/wikipedia');
          const data = await fetchSummary(title, 'en');
          const newCache = { ...get().summaryCache };
          newCache[title] = { data, timestamp: Date.now() };
          set({ summaryCache: newCache, isLoading: false });
        } catch (e2) {
          set({ error: (e2 as Error).message, isLoading: false });
        }
      } else {
        set({ error: (e as Error).message, isLoading: false });
      }
    }
  },

  fetchAttractions: async (lat: number, lon: number) => {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = get().attractionsCache[key];
    if (cached && Date.now() - cached.timestamp < WIKI_CACHE_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const { searchNearby } = await import('../services/api/wikipedia');
      const nearby = await searchNearby(lat, lon);
      // Fetch summaries for top results
      const { fetchSummary } = await import('../services/api/wikipedia');
      const attractions: Attraction[] = [];
      for (const item of nearby.slice(0, 10)) {
        try {
          const summary = await fetchSummary(item.title, 'zh');
          attractions.push({
            title: summary.title,
            extract: summary.extract,
            thumbnail: summary.thumbnail,
            url: summary.url,
            lat: item.lat,
            lon: item.lon,
          });
        } catch {
          // Skip items that fail
        }
      }
      const newCache = { ...get().attractionsCache };
      newCache[key] = { data: attractions, timestamp: Date.now() };
      set({ attractionsCache: newCache, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
}));
