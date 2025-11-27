export interface SubtitleState {
  text: string;
  isLoading: boolean;
  theme: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
}

export interface FloatingObjectProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  geometryType: 'box' | 'cone' | 'sphere' | 'torus';
}