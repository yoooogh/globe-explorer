import type { CountryInfo } from '../types/country';
import { useStaticDataStore } from '../store/staticDataStore';

/**
 * Look up a country by lat/lon using bounding box matching.
 * Uses pre-loaded static data for instant results (no network call).
 */
export function lookupCountry(lat: number, lon: number): CountryInfo | undefined {
  const { countries } = useStaticDataStore.getState();
  if (!countries || Object.keys(countries).length === 0) return undefined;

  let bestMatch: CountryInfo | undefined;
  let bestScore = Infinity;

  for (const iso of Object.keys(countries)) {
    const country = countries[iso];
    if (!country.bbox) continue;

    const [minLon, minLat, maxLon, maxLat] = country.bbox;

    // Check if the point is inside the bounding box
    if (lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat) {
      // Calculate center offset as a score (closer to center = better match)
      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;
      const score = Math.abs(lat - centerLat) + Math.abs(lon - centerLon);

      if (score < bestScore) {
        bestScore = score;
        bestMatch = country;
      }
    }
  }

  return bestMatch;
}
