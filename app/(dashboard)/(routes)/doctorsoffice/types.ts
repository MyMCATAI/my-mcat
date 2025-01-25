export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface GridImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
}

export interface Category {
  id: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  section: string;
}

export interface SpritePosition {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  character: number;
}

export type SpritePositions = {
  [key: string]: SpritePosition;
};

export type Waypoint = {
  x: number;
  y: number;
  direction: Direction;
}; 