import { OWM_TILE_BASE } from '../../utils/constants';

type OwmLayer = 'clouds_new' | 'temp_new' | 'precipitation_new' | 'wind_new';

export function buildOwmTileUrl(layer: OwmLayer): string {
  const apiKey = import.meta.env.VITE_OWM_API_KEY || 'demo';
  return `${OWM_TILE_BASE}/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
}

export function createCloudLayer(Cesium: any) {
  const provider = new Cesium.UrlTemplateImageryProvider({
    url: buildOwmTileUrl('clouds_new'),
    maximumLevel: 8,
    hasAlphaChannel: true,
    credit: new Cesium.Credit('OpenWeatherMap', undefined, false),
  });

  return provider;
}

export function createTemperatureLayer(Cesium: any) {
  const provider = new Cesium.UrlTemplateImageryProvider({
    url: buildOwmTileUrl('temp_new'),
    maximumLevel: 8,
    hasAlphaChannel: true,
    credit: new Cesium.Credit('OpenWeatherMap', undefined, false),
  });

  return provider;
}

export function createPrecipitationLayer(Cesium: any) {
  const provider = new Cesium.UrlTemplateImageryProvider({
    url: buildOwmTileUrl('precipitation_new'),
    maximumLevel: 8,
    hasAlphaChannel: true,
    credit: new Cesium.Credit('OpenWeatherMap', undefined, false),
  });

  return provider;
}
