const OWM_TILE_BASE = 'https://tile.openweathermap.org/map';

export type OwmLayer = 'clouds_new' | 'temp_new' | 'precipitation_new' | 'wind_new';

export function buildTileUrl(layer: OwmLayer): string {
  const apiKey = import.meta.env.VITE_OWM_API_KEY || '9de243494c0b295d43a2e418b6d4f1a2'; // default demo key
  return `${OWM_TILE_BASE}/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
}
