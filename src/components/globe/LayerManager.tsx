import { useEffect, useRef } from 'react';
import { useGlobeStore } from '../../store/globeStore';
import {
  createCloudLayer,
  createTemperatureLayer,
  createPrecipitationLayer,
} from '../../services/cesium/imageryLayers';

const layerRefs: Map<string, any> = new Map();

export function LayerManager() {
  const layers = useGlobeStore((s) => s.layers);
  // We poll the viewer from the module-level getter
  const initialized = useRef(false);

  useEffect(() => {
    const viewer = useGlobeStore.getState().getViewer();
    if (!viewer) return;

    const Cesium = viewer.__CesiumModule;
    if (!Cesium) return;

    initialized.current = true;

    // Cloud layer
    if (layers.clouds && !layerRefs.has('clouds')) {
      try {
        const provider = createCloudLayer(Cesium);
        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layer.alpha = 0.5;
        layerRefs.set('clouds', layer);
      } catch (e) {
        console.warn('Failed to add cloud layer:', e);
      }
    } else if (!layers.clouds && layerRefs.has('clouds')) {
      viewer.imageryLayers.remove(layerRefs.get('clouds'));
      layerRefs.delete('clouds');
    }

    // Temperature layer
    if (layers.temperature && !layerRefs.has('temperature')) {
      try {
        const provider = createTemperatureLayer(Cesium);
        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layer.alpha = 0.5;
        layerRefs.set('temperature', layer);
      } catch (e) {
        console.warn('Failed to add temperature layer:', e);
      }
    } else if (!layers.temperature && layerRefs.has('temperature')) {
      viewer.imageryLayers.remove(layerRefs.get('temperature'));
      layerRefs.delete('temperature');
    }

    // Precipitation layer
    if (layers.precipitation && !layerRefs.has('precipitation')) {
      try {
        const provider = createPrecipitationLayer(Cesium);
        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layer.alpha = 0.4;
        layerRefs.set('precipitation', layer);
      } catch (e) {
        console.warn('Failed to add precipitation layer:', e);
      }
    } else if (!layers.precipitation && layerRefs.has('precipitation')) {
      viewer.imageryLayers.remove(layerRefs.get('precipitation'));
      layerRefs.delete('precipitation');
    }
  }, [layers.clouds, layers.temperature, layers.precipitation]);

  return null;
}
