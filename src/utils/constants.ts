// API base URLs
export const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
export const WIKIPEDIA_REST_BASE = 'https://en.wikipedia.org/api/rest_v1';
export const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';
export const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Cache TTLs in milliseconds
export const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
export const WIKI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
export const GEOCODE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Debounce delays
export const SEARCH_DEBOUNCE_MS = 350;
export const RESIZE_DEBOUNCE_MS = 200;

// Cesium defaults
export const DEFAULT_CAMERA_HEIGHT = 15_000_000; // meters (planet view)
export const COUNTRY_FLY_HEIGHT = 800_000;
export const CITY_FLY_HEIGHT = 50_000;

// OpenWeatherMap tile URLs
export const OWM_TILE_BASE = 'https://tile.openweathermap.org/map';
