import { create } from 'zustand';
import type { CountryInfo, ClimateSummary, VegetationSummary } from '../types/country';
import { loadCities, type CityInfo } from '../utils/cityLookup';

interface CultureData {
  isoA2: string;
  summary: string;
}

export interface AttractionItem {
  name: string;
  desc: string;
  lat: number;
  lon: number;
}

interface AttractionData {
  isoA2: string;
  attractions: AttractionItem[];
}

interface StaticDataState {
  countries: Record<string, CountryInfo>;
  climate: Record<string, ClimateSummary>;
  vegetation: Record<string, VegetationSummary>;
  culture: Record<string, string>;
  attractions: Record<string, AttractionItem[]>; // isoA2 -> attractions
  countryNameMap: Record<string, CountryInfo>;
  isLoaded: boolean;

  loadAll: () => Promise<void>;
  getCountry: (iso: string) => CountryInfo | undefined;
  getClimate: (iso: string) => ClimateSummary | undefined;
  getVegetation: (iso: string) => VegetationSummary | undefined;
  getCulture: (iso: string) => string | undefined;
  getAttractions: (iso: string) => AttractionItem[];
  findCountryByName: (name: string) => CountryInfo | undefined;
}

export const useStaticDataStore = create<StaticDataState>((set, get) => ({
  countries: {},
  climate: {},
  vegetation: {},
  culture: {},
  attractions: {},
  countryNameMap: {},
  isLoaded: false,

  loadAll: async () => {
    if (get().isLoaded) return;

    try {
      const [countriesRes, climateRes, vegetationRes, citiesRes, cultureRes, attractionsRes] = await Promise.all([
        fetch('/data/countries.json'),
        fetch('/data/climate.json'),
        fetch('/data/vegetation.json'),
        fetch('/data/cities.json'),
        fetch('/data/culture.json'),
        fetch('/data/attractions.json'),
      ]);

      const countriesArr: CountryInfo[] = await countriesRes.json();
      const climateArr: ClimateSummary[] = await climateRes.json();
      const vegetationArr: VegetationSummary[] = await vegetationRes.json();
      const citiesArr: CityInfo[] = await citiesRes.json();
      const cultureArr: CultureData[] = await cultureRes.json();
      const attractionsArr: AttractionData[] = await attractionsRes.json();
      loadCities(citiesArr);

      const countries: Record<string, CountryInfo> = {};
      const countryNameMap: Record<string, CountryInfo> = {};
      for (const c of countriesArr) {
        countries[c.isoA2] = c;
        countryNameMap[c.name.toLowerCase()] = c;
        countryNameMap[c.nameCN.toLowerCase()] = c;
      }

      const climate: Record<string, ClimateSummary> = {};
      for (const c of climateArr) {
        climate[c.isoA2] = c;
      }

      const vegetation: Record<string, VegetationSummary> = {};
      for (const v of vegetationArr) {
        vegetation[v.isoA2] = v;
      }

      const culture: Record<string, string> = {};
      for (const c of cultureArr) {
        culture[c.isoA2] = c.summary;
      }

      const attractions: Record<string, AttractionItem[]> = {};
      for (const a of attractionsArr) {
        attractions[a.isoA2] = a.attractions;
      }

      set({ countries, climate, vegetation, culture, attractions, countryNameMap, isLoaded: true });
    } catch (e) {
      console.error('Failed to load static data:', e);
      set({ isLoaded: true });
    }
  },

  getCountry: (iso) => get().countries[iso],
  getClimate: (iso) => get().climate[iso],
  getVegetation: (iso) => get().vegetation[iso],
  getCulture: (iso) => get().culture[iso],
  getAttractions: (iso) => get().attractions[iso] ?? [],
  findCountryByName: (name) => get().countryNameMap[name.toLowerCase()],
}));
