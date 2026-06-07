import { httpGet } from './httpClient';
import type { WikiSummary, WikiSearchResult } from '../../types/wiki';

// Try multiple Wikimedia endpoints for better availability in China
const WIKI_ENDPOINTS = [
  'https://zh.wikipedia.org',
  'https://en.wikipedia.org',
];

const CORS_PROXIES = [
  '',
  'https://corsproxy.io/?',
];

interface RestSummaryResponse {
  title: string;
  extract: string;
  description: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page: string } };
}

export async function fetchSummary(
  title: string,
  lang = 'zh',
): Promise<WikiSummary> {
  const base = lang === 'zh' ? WIKI_ENDPOINTS[0] : WIKI_ENDPOINTS[1];
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  let lastError: Error | null = null;

  // Try direct first
  try {
    const raw = await httpGet<RestSummaryResponse>(url, 8000);
    return parseSummary(raw, lang, title);
  } catch (e) {
    lastError = e as Error;
  }

  // Try CORS proxy
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const raw = await httpGet<RestSummaryResponse>(proxyUrl, 12000);
    return parseSummary(raw, lang, title);
  } catch (e) {
    lastError = e as Error;
  }

  // Try MediaWiki action API as last resort
  try {
    const apiUrl = `${base}/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const raw = await httpGet<any>(apiUrl, 8000);
    const pages = raw?.query?.pages ?? {};
    const page: any = Object.values(pages)[0];

    if (page && page.extract) {
      return {
        title: page.title,
        extract: page.extract,
        description: '',
        thumbnail: null,
        url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      };
    }
  } catch (e) {
    lastError = e as Error;
  }

  throw lastError || new Error('所有 Wikipedia 端点不可用');
}

function parseSummary(raw: RestSummaryResponse, lang: string, title: string): WikiSummary {
  return {
    title: raw.title,
    extract: raw.extract ?? '',
    description: raw.description ?? '',
    thumbnail: raw.thumbnail?.source ?? null,
    url: raw.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

interface GeoSearchResponse {
  query: {
    geosearch: Array<{
      title: string;
      lat: number;
      lon: number;
      dist: number;
      pageid: number;
    }>;
  };
}

export async function searchNearby(
  lat: number,
  lon: number,
  radiusMeters = 50_000,
  lang = 'zh',
): Promise<WikiSearchResult[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'geosearch',
    gscoord: `${lat}|${lon}`,
    gsradius: String(radiusMeters),
    gslimit: '20',
    format: 'json',
    origin: '*',
  });

  const base = lang === 'zh' ? WIKI_ENDPOINTS[0] : WIKI_ENDPOINTS[1];

  // Try direct
  try {
    const url = `${base}/w/api.php?${params.toString()}`;
    const raw = await httpGet<GeoSearchResponse>(url, 10_000);
    return parseGeoSearch(raw);
  } catch {
    // Try CORS proxy
    try {
      const url = `${base}/w/api.php?${params.toString()}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const raw = await httpGet<GeoSearchResponse>(proxyUrl, 12000);
      return parseGeoSearch(raw);
    } catch {
      // Try English Wikipedia
      try {
        const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
        const raw = await httpGet<GeoSearchResponse>(url, 10_000);
        return parseGeoSearch(raw);
      } catch {
        return [];
      }
    }
  }
}

function parseGeoSearch(raw: GeoSearchResponse): WikiSearchResult[] {
  return (raw.query?.geosearch ?? []).map((item) => ({
    title: item.title,
    lat: item.lat,
    lon: item.lon,
    distanceMeters: item.dist,
    pageId: item.pageid,
  }));
}
