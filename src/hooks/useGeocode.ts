import { useEffect, useRef } from 'react';
import { useSearchStore } from '../store/searchStore';
import { geocodeSearch } from '../services/api/nominatim';
import { SEARCH_DEBOUNCE_MS } from '../utils/constants';

export function useGeocode() {
  const query = useSearchStore((s) => s.query);
  const setResults = useSearchStore((s) => s.setResults);
  const setIsSearching = useSearchStore((s) => s.setIsSearching);
  const setError = useSearchStore((s) => s.setError);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    abortRef.current = false;

    timerRef.current = setTimeout(async () => {
      try {
        const results = await geocodeSearch(query);
        if (!abortRef.current) {
          setResults(results);
        }
      } catch (e) {
        if (!abortRef.current) {
          setError((e as Error).message);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      abortRef.current = true;
    };
  }, [query, setResults, setIsSearching, setError]);

  return {
    results: useSearchStore((s) => s.results),
    isSearching: useSearchStore((s) => s.isSearching),
  };
}
