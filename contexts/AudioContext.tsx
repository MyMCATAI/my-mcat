"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAudio as useZustandAudio } from '@/store/selectors';


/* -------------------------------------------- Types ------------------------------------------- */
interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface AudioContextType {
  isPlaying: boolean;
  currentSong: string | null;
  volume: number;  // Single volume control
  playMusic: (src: string, shouldPlay?: boolean, onEnded?: () => void) => void;
  stopMusic: () => void;
  setVolume: (newVolume: number) => void;  // Simplified volume setter
  playSound: (soundName: string) => void;
  loopSound: (soundName: string) => void;
  stopLoopSound: (soundName: string) => void;
  stopAllLoops: () => void;
  getActiveLoops: () => string[];
}


const AudioContext = createContext<AudioContextType | null>(null);

/* ------------------------------------------ Constants ----------------------------------------- */
const AUDIO_BUFFER_CACHE = new Map<string, AudioBuffer>();
const BUFFER_CACHE_LIMIT = 20; // MB
const MUSIC_SOURCE = new Map<string, AudioBufferSourceNode>();
const LOOP_SOURCES = new Map<string, {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}>();

// Single master gain node for all audio
let masterGainNode: GainNode | null = null;

const SOUND_CATEGORIES = {
  MUSIC: 'music',
  SFX: 'sfx',
  AMBIENT: 'ambient'
} as const;

// Add type for gain nodes reference
type CategoryGains = {
  [SOUND_CATEGORIES.MUSIC]: GainNode;
  [SOUND_CATEGORIES.SFX]: GainNode;
  [SOUND_CATEGORIES.AMBIENT]: GainNode;
};

// Update SOUND_MAPPINGS to use SOUND_CATEGORIES
const SOUND_MAPPINGS: Record<string, keyof CategoryGains> = {
  'flashcard-door-open': SOUND_CATEGORIES.SFX,
  'flashcard-door-closed': SOUND_CATEGORIES.SFX,
  'flashcard-loop-catfootsteps': SOUND_CATEGORIES.AMBIENT,
  'elevenlabs-response': SOUND_CATEGORIES.SFX,
  // ... other sound mappings
};

interface AudioContextState {
  musicNode?: AudioNode;
  effectNodes: Map<string, AudioNode>;
  // ... other state
}

// Add these constants at the top with other constants
const AUDIO_CONTEXT_CONFIG: AudioContextOptions = {
  latencyHint: 'interactive' as AudioContextLatencyCategory,
  sampleRate: 44100
};

// Remove category gains and just use coefficients
const VOLUME_COEFFICIENTS = {
  [SOUND_CATEGORIES.MUSIC]: 1.0,  // Music at full volume
  [SOUND_CATEGORIES.SFX]: 0.5,    // SFX at half volume
  [SOUND_CATEGORIES.AMBIENT]: 0.75  // Ambient at half volume
} as const;

/* --- Constants ----- */
const DEBUG = process.env.NODE_ENV === 'development';

const logError = (error: Error, context: string) => {
  if (DEBUG) {
    console.error(`🎵 [Audio] ${context}:`, error);
  }
  // Always show user-facing error
  toast.error('Audio playback issue. Please refresh if this persists.');
};

/* ------------------------------------------ Provider ----------------------------------------- */
/**
 * @deprecated Use useAudio from store/selectors instead
 * This provider is maintained for backward compatibility only
 */
export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  console.debug('[AudioContext] Using compatibility layer - consider migrating to useAudio from store/selectors');
  
  // Use the Zustand store implementation
  const audio = useZustandAudio();
  
  // Create a compatibility layer that matches the old API
  const compatibilityLayer: AudioContextType = {
    isPlaying: audio.isPlaying,
    currentSong: audio.currentSong,
    volume: audio.volume,
    playMusic: audio.playMusic,
    stopMusic: audio.stopMusic,
    setVolume: audio.setVolume,
    playSound: audio.playSound,
    loopSound: audio.loopSound,
    stopLoopSound: audio.stopLoopSound,
    stopAllLoops: audio.stopAllLoops,
    getActiveLoops: audio.getActiveLoops,
  };
  
  return (
    <AudioContext.Provider value={compatibilityLayer}>
      {children}
    </AudioContext.Provider>
  );
};

/**
 * @deprecated Use useAudio from store/selectors instead
 * This hook is maintained for backward compatibility only
 */
export const useAudio = (): AudioContextType => {
  // Try to use the context first for backward compatibility
  const context = useContext(AudioContext);
  
  if (context) {
    return context;
  }
  
  // If no context is available (e.g., outside provider), use the store directly
  console.debug('[AudioContext] No context provider found, using store directly');
  return useZustandAudio();
};

export default AudioContext;