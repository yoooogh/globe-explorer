import { useEffect, useState } from 'react';
import { useWikiStore } from '../store/wikiStore';
import type { WikiSummary } from '../types/wiki';

export function useWikipediaSummary(title: string | undefined) {
  const fetchSummary = useWikiStore((s) => s.fetchSummary);
  const cache = useWikiStore((s) => s.summaryCache);
  const isLoading = useWikiStore((s) => s.isLoading);
  const error = useWikiStore((s) => s.error);

  useEffect(() => {
    if (title && title.trim()) {
      fetchSummary(title);
    }
  }, [title, fetchSummary]);

  const data: WikiSummary | null = title ? cache[title]?.data ?? null : null;

  return { data, loading: isLoading, error };
}

export function useWikipediaAttractions(lat: number | undefined, lon: number | undefined) {
  const fetchAttractions = useWikiStore((s) => s.fetchAttractions);
  const cache = useWikiStore((s) => s.attractionsCache);
  const isLoading = useWikiStore((s) => s.isLoading);
  const error = useWikiStore((s) => s.error);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      const k = `${lat.toFixed(2)},${lon.toFixed(2)}`;
      setKey(k);
      fetchAttractions(lat, lon);
    }
  }, [lat, lon, fetchAttractions]);

  const data = key ? cache[key]?.data ?? null : null;

  return { data, loading: isLoading, error };
}
