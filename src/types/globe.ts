export type LayerKey = 'clouds' | 'temperature' | 'precipitation' | 'borders';

export interface CameraPosition {
  latitude: number;
  longitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface ClickedEntity {
  entityId: string;
  type: 'country' | 'city' | 'poi' | 'custom';
  latitude: number;
  longitude: number;
  properties: Record<string, unknown>;
}
