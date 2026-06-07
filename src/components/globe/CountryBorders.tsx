import { useEffect, useRef } from 'react';
import { useGlobeStore } from '../../store/globeStore';

/**
 * Loads country border GeoJSON as a Cesium GeoJsonDataSource.
 * Borders are toggled via globeStore.layers.borders.
 */
export function CountryBorders() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    const viewer = useGlobeStore.getState().getViewer();
    if (!viewer) return;

    const Cesium = viewer.__CesiumModule;
    if (!Cesium) return;

    loaded.current = true;

    // Load a simplified world countries GeoJSON
    // Using Natural Earth low-res dataset hosted on GitHub
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/main/data/countries.geojson')
      .then((res) => res.json())
      .then(async (geojson) => {
        const dataSource = new Cesium.GeoJsonDataSource();
        await dataSource.load(geojson, {
          stroke: Cesium.Color.fromCssColorString('#4fc3f7'),
          strokeWidth: 1.5,
          fill: Cesium.Color.TRANSPARENT,
        });
        viewer.dataSources.add(dataSource);

        // Make each entity clickable
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties?.getValue();
          if (props) {
            entity.description = props.name || props.ADMIN || '';
            (entity as any)._clickable = true;
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load country borders:', err);
      });
  }, []);

  return null;
}
