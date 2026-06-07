import { create } from 'zustand';
import type { LayerKey } from '../types/globe';

// We use a module-level variable for the viewer to avoid
// serialization issues with Cesium objects in Zustand state
let _viewer: any = null;

interface GlobeState {
  isViewerReady: boolean;
  layers: Record<LayerKey, boolean>;

  setViewer: (viewer: any) => void;
  getViewer: () => any;
  setViewerReady: (ready: boolean) => void;
  toggleLayer: (layer: LayerKey) => void;
  setLayer: (layer: LayerKey, visible: boolean) => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  isViewerReady: false,
  layers: { clouds: false, temperature: false, precipitation: false, borders: true },

  setViewer: (viewer) => {
    _viewer = viewer;
  },
  getViewer: () => _viewer,
  setViewerReady: (ready) => set({ isViewerReady: ready }),

  toggleLayer: (layer) =>
    set((s) => ({
      layers: { ...s.layers, [layer]: !s.layers[layer] },
    })),

  setLayer: (layer, visible) =>
    set((s) => ({
      layers: { ...s.layers, [layer]: visible },
    })),
}));

// Convenience: get viewer outside React (in Cesium callbacks)
export function getViewer() {
  return _viewer;
}
