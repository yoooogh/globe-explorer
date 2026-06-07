import { useState, useRef, useEffect } from 'react';
import { useSearchStore } from '../../store/searchStore';
import { useGeocode } from '../../hooks/useGeocode';
import { useCameraFlight } from '../../hooks/useCameraFlight';
import { useSelectionStore } from '../../store/selectionStore';
import { lookupCountry } from '../../utils/countryLookup';
import './SearchBar.css';

export function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const results = useSearchStore((s) => s.results);
  const isSearching = useSearchStore((s) => s.isSearching);
  const { flyTo } = useCameraFlight();
  const setSelected = useSelectionStore((s) => s.setSelected);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Trigger geocode search
  useGeocode();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setQuery(val);
    if (val.trim().length >= 2) setIsOpen(true);
  };

  const handleSelect = (result: typeof results[0]) => {
    setIsOpen(false);
    setInputValue(result.displayName);

    // Determine type from display name
    const isCity = result.type === 'city' || result.type === 'town' || result.type === 'village';
    const flightType = isCity ? 'city' : 'country';

    // Look up country info
    const country = lookupCountry(result.latitude, result.longitude);

    flyTo(result.latitude, result.longitude, flightType);

    // Set selection after a short delay for camera to arrive
    setTimeout(() => {
      setSelected({
        latitude: result.latitude,
        longitude: result.longitude,
        countryCode: country?.isoA2 ?? 'SEARCH',
        countryName: country?.nameCN || country?.name || result.displayName,
        placeName: isCity ? result.displayName : undefined,
      });
    }, 1800);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="searchbar" ref={wrapperRef}>
      <div className="searchbar__input-wrapper">
        <span className="searchbar__icon">🔍</span>
        <input
          type="text"
          className="searchbar__input"
          placeholder="搜索国家或城市..."
          value={inputValue}
          onChange={handleChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isSearching && <span className="searchbar__spinner" />}
        {inputValue && (
          <button className="searchbar__clear" onClick={() => {
            setInputValue('');
            setQuery('');
            setIsOpen(false);
          }}>
            ✕
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="searchbar__dropdown">
          {results.map((r, i) => (
            <li
              key={`${r.latitude}-${r.longitude}-${i}`}
              className="searchbar__item"
              onClick={() => handleSelect(r)}
            >
              <span className="searchbar__item-icon">
                {r.type === 'country' ? '🌏' : '📍'}
              </span>
              <span className="searchbar__item-text">{r.displayName}</span>
            </li>
          ))}
        </ul>
      )}
      {isOpen && !isSearching && results.length === 0 && query.trim().length >= 2 && (
        <div className="searchbar__dropdown searchbar__dropdown--empty">
          未找到结果
        </div>
      )}
    </div>
  );
}
