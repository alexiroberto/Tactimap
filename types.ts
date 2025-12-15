export interface Zone {
  id: string;
  lat: number;
  lng: number;
  radius: number; // Used as Outer Radius for Keyhole (Hot Zone)
  innerRadius?: number; // Used for the inner circle in Keyhole
  timestamp: number;
  type: 'circle' | 'sector' | 'keyhole';
  bearing?: number; // 0-360 degrees, required if type is 'sector' or 'keyhole'
  hasWarmZone?: boolean; // Determines if the yellow Warm Zone (+50m) should be rendered
  description?: string; // Info text e.g. "Risk för BLEVE"
  address?: string; // Reversed geocoded address for the center
}

export interface TacticalMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string; // Address
  type: 'breakpoint' | 'assembly' | 'decon' | 'command' | 'generic' | 'ledningsplats' | 'sps' | 'sektor' | 'mob';
  createdAt?: number; // Timestamp for when marker was placed (used for MOB drift)
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface SearchLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface WindData {
  speed: number;
  deg: number;
  timestamp: number;
}

export type RoadPath = Array<{ lat: number; lng: number }>;

export enum AppMode {
  VIEW = 'VIEW',
  PLACE = 'PLACE',
}

export type ToolType = 'none' | 'zone' | 'breakpoint' | 'assembly' | 'decon' | 'command' | 'ledningsplats' | 'sps' | 'sektor' | 'mob';

export type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';