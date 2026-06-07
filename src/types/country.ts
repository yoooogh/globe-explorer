export interface CountryInfo {
  isoA2: string;
  isoA3: string;
  name: string;
  nameCN: string;
  capital: string;
  centerLat: number;
  centerLon: number;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  continent: string;
  population: number;
}

export interface ClimateSummary {
  isoA2: string;
  koppenZones: string[];
  description: string;
  avgTempRange: string;
  rainySeason: string;
}

export interface VegetationSummary {
  isoA2: string;
  biomes: string[];
  description: string;
  forestCoverPercent: number;
}
