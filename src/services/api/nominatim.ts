import { httpGet } from './httpClient';
import type { GeocodeResult } from '../../types/geocode';
import { NOMINATIM_BASE, GEOCODE_CACHE_TTL } from '../../utils/constants';

// Simple in-memory cache
const cache: Map<string, { data: GeocodeResult[]; timestamp: number }> = new Map();

export async function geocodeSearch(
  query: string,
): Promise<GeocodeResult[]> {
  if (query.trim().length < 2) return [];

  // Check cache
  const cached = cache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < GEOCODE_CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '0',
    'accept-language': 'zh',
  });

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;
  const raw = await httpGet<any[]>(url, 8000, {
    'User-Agent': 'GlobeExplorer/1.0 (educational project)',
  });

  const results: GeocodeResult[] = raw.map((item) => ({
    displayName: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    type: item.type,
    importance: item.importance ?? 0,
  }));

  // Update cache
  cache.set(query.toLowerCase(), { data: results, timestamp: Date.now() });

  // Limit cache size
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  return results;
}

// Reverse geocode: find country name from coordinates
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lon.toFixed(5),
    format: 'json',
    zoom: '3', // country-level
    addressdetails: '0',
  });

  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;
  try {
    const raw = await httpGet<any>(url, 5000, {
      'User-Agent': 'GlobeExplorer/1.0 (educational project)',
    });
    return raw?.display_name?.split(',')?.pop()?.trim() ?? null;
  } catch {
    return null;
  }
}
