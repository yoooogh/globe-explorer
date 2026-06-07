export interface CityInfo {
  name: string;
  nameEN: string;
  lat: number;
  lon: number;
  country: string;
  pop: number;
}

let _cities: CityInfo[] = [];

export function loadCities(cities: CityInfo[]) {
  _cities = cities;
}

/**
 * Find the nearest city to a given lat/lon using Haversine distance.
 * Returns the nearest city if within 200km, otherwise null.
 */
export function findNearestCity(lat: number, lon: number, maxDistanceKm = 200): CityInfo | null {
  if (_cities.length === 0) return null;

  let bestCity: CityInfo | null = null;
  let bestDist = Infinity;

  for (const city of _cities) {
    const d = haversineDistance(lat, lon, city.lat, city.lon);
    if (d < bestDist) {
      bestDist = d;
      bestCity = city;
    }
  }

  if (bestCity && bestDist <= maxDistanceKm) {
    return bestCity;
  }

  return null;
}

/**
 * Haversine formula for calculating distance between two lat/lon points.
 * Returns distance in kilometers.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
