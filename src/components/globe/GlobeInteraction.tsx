import { useGlobeClick } from '../../hooks/useGlobeClick';

/**
 * GlobeInteraction: Renders nothing (no DOM).
 * Calls the useGlobeClick hook to set up ScreenSpaceEventHandler
 * for click and hover interactions on the Cesium viewer.
 */
export function GlobeInteraction() {
  useGlobeClick();
  return null;
}
