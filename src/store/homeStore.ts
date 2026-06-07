import { create } from 'zustand';

interface HomeLocation {
  lat: number;
  lon: number;
  name: string;
}

interface HomeState {
  home: HomeLocation | null;
  setHome: (h: HomeLocation) => void;
  clearHome: () => void;
}

// Try to restore from localStorage
function loadSaved(): HomeLocation | null {
  try {
    const raw = localStorage.getItem('homeLocation');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(h: HomeLocation | null) {
  if (h) localStorage.setItem('homeLocation', JSON.stringify(h));
  else localStorage.removeItem('homeLocation');
}

export const useHomeStore = create<HomeState>((set) => ({
  home: loadSaved(),

  setHome: (h) => {
    save(h);
    set({ home: h });
  },
  clearHome: () => {
    save(null);
    set({ home: null });
  },
}));
