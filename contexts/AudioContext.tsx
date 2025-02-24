"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';


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

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [volumeState, setVolumeState] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const categoryGainsRef = useRef<CategoryGains | null>(null);

  const handleAudioError = useCallback((error: Error, context: string) => {
    console.error(`🎵 [AudioContext] ${context}:`, error);
    
    // Check for specific error types
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      toast.error('Please interact with the page first to enable audio.');
    } else if (error.name === 'EncodingError') {
      toast.error('This audio format is not supported by your browser.');
    } else {
      toast.error('Failed to play audio. Please try again.');
    }
  }, []);

  const initializeAudioContext = useCallback(async () => {
    try {
      if (audioContextRef.current?.state === 'running') {
        return audioContextRef.current;
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
        return audioContextRef.current;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(AUDIO_CONTEXT_CONFIG);
      await ctx.resume();
      audioContextRef.current = ctx;

      // Single master gain node
      masterGainNode = ctx.createGain();
      masterGainNode.connect(ctx.destination);
      masterGainNode.gain.value = volumeState;

      return ctx;
    } catch (error) {
      logError(error as Error, 'Audio context initialization failed');
      throw error;
    }
  }, [volumeState]);

  const loadAudioBuffer = useCallback(async (url: string): Promise<AudioBuffer> => {
    // Check cache size before adding new buffer
    let totalSize = 0;
    for (const buffer of AUDIO_BUFFER_CACHE.values()) {
      totalSize += buffer.length * buffer.numberOfChannels * 4; // 4 bytes per sample
    }
    
    if (totalSize > BUFFER_CACHE_LIMIT * 1024 * 1024) {
      // Clear oldest entries if cache is too large
      const oldestKey = AUDIO_BUFFER_CACHE.keys().next().value;
      if (oldestKey) {
        AUDIO_BUFFER_CACHE.delete(oldestKey);
      }
    }
    
    const ctx = await initializeAudioContext();
    if (!ctx) throw new Error('Failed to initialize audio context');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      // Cache the decoded buffer
      AUDIO_BUFFER_CACHE.set(url, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      logError(error as Error, `Failed to load audio: ${url}`);
      throw error;
    }
  }, [initializeAudioContext, handleAudioError]);

  const stopMusic = useCallback(() => {
    MUSIC_SOURCE.forEach((source, url) => {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
        MUSIC_SOURCE.delete(url);
      } catch (error) {
        logError(error as Error, 'Error stopping music');
      }
    });

    setIsPlaying(false);
    setCurrentSong(null);
  }, []);

  const playMusic = useCallback(async (url: string, autoplay = true, onEnded?: () => void) => {
    if (!autoplay) {
      stopMusic();
      return null;
    }

    try {
      if (MUSIC_SOURCE.size > 0) {
        stopMusic();
      }

      const audioBuffer = await loadAudioBuffer(url);
      const ctx = await initializeAudioContext();
      if (!ctx) throw new Error('No audio context');

      setIsPlaying(true);
      setCurrentSong(url);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Add gain node with music coefficient
      const gainNode = ctx.createGain();
      gainNode.gain.value = volumeState * VOLUME_COEFFICIENTS[SOUND_CATEGORIES.MUSIC];
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(masterGainNode!);

      MUSIC_SOURCE.set(url, source);
      
      if (autoplay) {
        source.start(0);
      }

      source.onended = () => {
        MUSIC_SOURCE.delete(url);
        setIsPlaying(false);
        setCurrentSong(null);
        onEnded?.();
      };

      return source;
    } catch (error) {
      logError(error as Error, 'Error playing music');
      return null;
    }
  }, [loadAudioBuffer, initializeAudioContext, stopMusic, handleAudioError, volumeState]);

  // All audio sources connect to master gain node
  const playSound = useCallback(async (soundName: string) => {
    try {
      const ctx = await initializeAudioContext();
      const buffer = await loadAudioBuffer(`/audio/${soundName}.mp3`);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      // Get appropriate coefficient
      const category = SOUND_MAPPINGS[soundName] || SOUND_CATEGORIES.SFX;
      const coefficient = VOLUME_COEFFICIENTS[category];
      
      // Create gain node with coefficient
      const localGain = ctx.createGain();
      localGain.gain.value = volumeState * coefficient;
      
      // Connect nodes
      source.connect(localGain);
      localGain.connect(masterGainNode!);
      
      // Fade in
      localGain.gain.setValueAtTime(0, ctx.currentTime);
      localGain.gain.linearRampToValueAtTime(coefficient * volumeState, ctx.currentTime + 0.02);
      
      source.start();
      
      // Fade out
      const duration = buffer.duration;
      localGain.gain.setValueAtTime(coefficient * volumeState, ctx.currentTime + duration - 0.05);
      localGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      
      source.onended = () => {
        source.disconnect();
        localGain.disconnect();
      };
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [initializeAudioContext, loadAudioBuffer, volumeState]);

  // Simplify setVolume to only control master gain
  const setVolume = useCallback((newVolume: number) => {
    if (!masterGainNode || !audioContextRef.current) return;

    const now = audioContextRef.current.currentTime;
    masterGainNode.gain.cancelScheduledValues(now);
    masterGainNode.gain.linearRampToValueAtTime(newVolume, now + 0.1);
    setVolumeState(newVolume);
  }, []);

  const recoverAudioContext = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        return true;
      } catch (error) {
        // If resume fails, create new context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return audioContextRef.current.state === 'running';
      }
    }
    return false;
  }, []);

  const monitorPerformance = useCallback((ctx: AudioContext) => {
    if (!DEBUG) return;
    
    if (ctx.baseLatency > 0.025) {
      console.warn('High audio latency detected:', ctx.baseLatency);
    }
    
    if ((ctx as any).getOutputTimestamp) {
      const timestamp = (ctx as any).getOutputTimestamp();
      if (timestamp.contextTime > timestamp.performanceTime) {
        console.warn('Audio buffer underrun detected');
      }
    }
  }, []);
  
  const stopLoopSound = useCallback((soundName: string) => {
    const audio = LOOP_SOURCES.get(soundName);
    if (audio) {
      try {
        audio.source.stop();
        audio.source.disconnect();
        audio.gainNode.disconnect();
        LOOP_SOURCES.delete(soundName);
      } catch (error) {
        console.error('Error stopping ambient sound:', error);
      }
    }
  }, []);

  const stopAllLoops = useCallback(() => {
    LOOP_SOURCES.forEach((audio, name) => {
      try {
        audio.source.stop();
        audio.source.disconnect();
        audio.gainNode.disconnect();
        LOOP_SOURCES.delete(name);
      } catch (error) {
        console.error('Error stopping ambient sound:', error);
      }
    });
  }, []);

  // Update loopSound to use coefficient
  const loopSound = useCallback(async (soundName: string) => {
    const normalizedName = soundName.replace('/audio/', '').replace(/\.(mp3|wav)$/, '');
    const fullPath = `/audio/${normalizedName}.wav`;
    
    if (LOOP_SOURCES.has(fullPath)) {
      return;
    }

    try {
      const ctx = await initializeAudioContext();
      if (!ctx) throw new Error('Audio context not initialized');

      const audioBuffer = await loadAudioBuffer(fullPath);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      // Apply the appropriate volume coefficient
      const category = SOUND_MAPPINGS[normalizedName] || SOUND_CATEGORIES.AMBIENT;
      const coefficient = VOLUME_COEFFICIENTS[category];

      // Create local gain with fixed coefficient
      const gainNode = ctx.createGain();
      gainNode.gain.value = volumeState * coefficient;

      // Connect directly to master
      source.connect(gainNode);
      gainNode.connect(masterGainNode!);

      LOOP_SOURCES.set(fullPath, { source, gainNode });
      source.start(0);

    } catch (error) {
      console.error('Failed to start loop:', error);
      handleAudioError(error as Error, 'Failed to start audio loop');
    }
  }, [initializeAudioContext, volumeState, handleAudioError, loadAudioBuffer]);

  const getActiveLoops = useCallback(() => {
    return Array.from(LOOP_SOURCES.keys());
  }, []);

  useEffect(() => {
    return () => {
      stopAllLoops();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      masterGainNode = null;
    };
  }, []);

  // Move the existing context check after all hook declarations
  const existingContext = useContext(AudioContext);
  if (existingContext) {
    return <>{children}</>;
  }

  return (
    <AudioContext.Provider value={{
      isPlaying,
      currentSong,
      volume: volumeState,
      playMusic,
      stopMusic,
      setVolume,
      playSound,
      loopSound,
      stopLoopSound,
      stopAllLoops,
      getActiveLoops
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === null) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};