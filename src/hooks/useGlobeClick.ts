import { useEffect, useRef } from 'react';
import { useGlobeStore } from '../store/globeStore';
import { useSelectionStore, type SelectedLocation } from '../store/selectionStore';
import { lookupCountry } from '../utils/countryLookup';
import { findNearestCity } from '../utils/cityLookup';
import { useStaticDataStore } from '../store/staticDataStore';

export function useGlobeClick() {
  const handlerRef = useRef<any>(null);

  // We need to read viewer from the module-level getter, not from React state
  // to avoid stale closures in the click handler
  useEffect(() => {
    const checkAndSetup = () => {
      // Poll until viewer is ready
      const v = useGlobeStore.getState().getViewer();
      if (!v) {
        const timer = setTimeout(checkAndSetup, 200);
        return () => clearTimeout(timer);
      }

      const viewer = v;
      const Cesium = viewer.__CesiumModule;

      if (!Cesium) {
        const timer = setTimeout(checkAndSetup, 200);
        return () => clearTimeout(timer);
      }

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerRef.current = handler;

      handler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);

        // Check if user clicked an entity (country, city, etc.)
        if (Cesium.defined(picked) && picked.id) {
          const entity = picked.id;
          const props = entity.properties?.getValue?.();
          const position = entity.position?.getValue?.();

          if (position && props) {
            const cartographic = Cesium.Cartographic.fromCartesian(position);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            const iso = props.isoA2 ?? props.countryCode ?? '';

            const staticData = useStaticDataStore.getState();
            const country = staticData.getCountry(iso);
            const countryName = country?.nameCN || country?.name || props.name || iso;

            const selected: SelectedLocation = {
              latitude: lat,
              longitude: lon,
              countryCode: iso,
              countryName,
              placeName: props.placeName ?? undefined,
            };
            useSelectionStore.getState().setSelected(selected);
          }
        } else {
          // Clicked bare globe — pick position on ellipsoid
          const cartesian = viewer.scene.pickPosition(click.position);
          if (Cesium.defined(cartesian)) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);

            // First try to find nearest city (within 200km)
            const nearestCity = findNearestCity(lat, lon, 200);
            // Look up country from coordinates
            const country = lookupCountry(lat, lon);

            if (nearestCity && country) {
              // City-level precision: show city + country
              const selected: SelectedLocation = {
                latitude: nearestCity.lat,
                longitude: nearestCity.lon,
                countryCode: country.isoA2,
                countryName: country.nameCN || country.name,
                placeName: nearestCity.name,
              };
              useSelectionStore.getState().setSelected(selected);
            } else {
              // Fall back to country-level
              const selected: SelectedLocation = {
                latitude: lat,
                longitude: lon,
                countryCode: country?.isoA2 ?? 'UNKNOWN',
                countryName: country?.nameCN || country?.name || '未知区域',
              };
              useSelectionStore.getState().setSelected(selected);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Show tooltip on hover
      handler.setInputAction((move: any) => {
        const picked = viewer.scene.pick(move.endPosition);
        if (Cesium.defined(picked) && picked.id) {
          viewer.scene.canvas.style.cursor = 'pointer';
        } else {
          viewer.scene.canvas.style.cursor = 'grab';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      return;
    };

    const cleanup = checkAndSetup();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      handlerRef.current?.destroy();
      handlerRef.current = null;
    };
  }, []);
}
