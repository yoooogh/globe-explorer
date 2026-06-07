export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: '晴朗',
  1: '大部晴朗',
  2: '多云',
  3: '阴天',
  45: '有雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '中毛毛雨',
  55: '大毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '小阵雨',
  81: '中阵雨',
  82: '大阵雨',
  85: '小阵雪',
  86: '大阵雪',
  95: '雷暴',
  96: '冰雹雷暴',
  99: '大冰雹雷暴',
};
