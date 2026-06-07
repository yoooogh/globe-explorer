export interface WikiSummary {
  title: string;
  extract: string;
  description: string;
  thumbnail: string | null;
  url: string;
}

export interface WikiSearchResult {
  title: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  pageId: number;
}

export interface Attraction {
  title: string;
  extract: string;
  thumbnail: string | null;
  url: string;
  lat: number;
  lon: number;
}
