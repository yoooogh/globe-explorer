import { create } from 'zustand';
import type { WeatherData } from '../types/weather';
import { WEATHER_CACHE_TTL } from '../utils/constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface WeatherState {
  cache: Record<string, CacheEntry<WeatherData>>;
  currentKey: string | null;
  isLoading: boolean;
  error: string | null;

  fetchWeather: (lat: number, lon: number) => Promise<void>;
  getCached: (lat: number, lon: number) => WeatherData | null;
  getWeather: (lat: number, lon: number) => { data: WeatherData | null; loading: boolean; error: string | null };
}

const coordKey = (lat: number, lon: number) =>
  `${lat.toFixed(2)},${lon.toFixed(2)}`;

export const useWeatherStore = create<WeatherState>((set, get) => ({
  cache: {},
  currentKey: null,
  isLoading: false,
  error: null,

  fetchWeather: async (lat, lon) => {
    const key = coordKey(lat, lon);
    const cached = get().cache[key];

    if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
      set({ currentKey: key });
      return;
    }

    set({ isLoading: true, error: null, currentKey: key });
    try {
      const { fetchCurrentWeather } = await import('../services/api/openMeteo');
      const data = await fetchCurrentWeather(lat, lon);
      const newCache = { ...get().cache };
      newCache[key] = { data, timestamp: Date.now() };
      set({ cache: newCache, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  getCached: (lat, lon) => {
    const key = coordKey(lat, lon);
    const cached = get().cache[key];
    if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
      return cached.data;
    }
    return null;
  },

  getWeather: (lat, lon) => {
    const key = coordKey(lat, lon);
    const cached = get().cache[key];
    return {
      data: cached ? cached.data : null,
      loading: get().isLoading,
      error: get().error,
    };
  },
}));
