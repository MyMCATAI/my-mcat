// Shared type definitions for the store

// Window size type used in UI slice
export interface WindowSize {
  width: number;
  height: number;
  isDesktop: boolean;
}

// Theme type used in UI slice
export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue';

// Audio-related types
export interface AudioBufferSourceWithGain {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

// Re-export types from slices for convenience
export * from './slices/audioSlice';