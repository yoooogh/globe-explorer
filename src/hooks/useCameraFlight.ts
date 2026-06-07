import { useCallback } from 'react';
import { useGlobeStore } from '../store/globeStore';
import {
  flyToCountry,
  flyToCity,
  flyToCoordinates,
} from '../services/cesium/cameraTransitions';

export function useCameraFlight() {
  const viewer = useGlobeStore((s) => s.getViewer());

  const flyTo = useCallback(
    (lat: number, lon: number, type: 'country' | 'city' | 'custom' = 'country', height?: number) => {
      const v = viewer?.() ?? viewer;
      if (!v) return;
      const Cesium = v.__CesiumModule;
      if (!Cesium) return;

      switch (type) {
        case 'country':
          flyToCountry(v, Cesium, lat, lon);
          break;
        case 'city':
          flyToCity(v, Cesium, lat, lon);
          break;
        case 'custom':
          flyToCoordinates(v, Cesium, lat, lon, height ?? 500_000);
          break;
      }
    },
    [viewer],
  );

  return { flyTo };
}
