"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUI, useUser, useGame, useAudio } from '@/store/selectors'
import { useStore } from '@/store/store';
import { cn } from '@/lib/utils';

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

interface DebugPanelProps {
  isVisible?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false }) => {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [audioEvents, setAudioEvents] = useState<string[]>([]);
  
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const [isDebug, setIsDebug] = useState(false)
  
  // Zustand state
  const uiState = useUI()
  const userState = useUser()
  const gameState = useGame()
  const audioState = useAudio()

  /* --- Effects --- */
  // Simple debug mode logic - only use URL parameter
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    
    if (debugValue === 'true') {
      setIsDebug(true)
      document.body.classList.add('debug-mode')
    } else {
      // Any other value (including null) - disable debug mode
      setIsDebug(false)
      document.body.classList.remove('debug-mode')
    }
  }, [searchParams, pathname])

  // Create a safe version of audio state for display (without functions)
  const displayAudioState = {
    isPlaying: audioState.isPlaying,
    currentSong: audioState.currentSong,
    currentLoop: audioState.currentLoop,
    volume: audioState.volume,
    // Add additional audio state properties for debugging
    activeLoops: audioState.getActiveLoops?.() || []
  };

  // Get the raw store state for debugging
  const [rawStoreState, setRawStoreState] = useState<any>(null);
  
  useEffect(() => {
    // Import the store dynamically to avoid SSR issues
    import('@/store/store').then(module => {
      const { useStore } = module;
      // Get the raw state without selectors
      const state = useStore.getState();
      // Filter out only audio-related properties
      const audioKeys = Object.keys(state).filter(key => 
        key === 'isPlayingSong' || 
        key === 'currentSong' || 
        key === 'currentLoop' || 
        key === 'masterVolume' ||
        key === 'handleFlashcardsTransition' ||
        key === 'stopAllLoops' ||
        key === 'loopSound' ||
        key === 'stopLoopSound' ||
        key === 'playSound' ||
        key === 'playMusic' ||
        key === 'stopMusic' ||
        key === 'setMasterVolume'
      );
      
      const audioRawState = audioKeys.reduce((acc, key) => {
        // Only include serializable properties
        if (typeof state[key as keyof typeof state] !== 'function' && 
            !(state[key as keyof typeof state] instanceof Map) && 
            !(state[key as keyof typeof state] instanceof AudioContext) &&
            !(state[key as keyof typeof state] instanceof GainNode) &&
            !key.startsWith('_')) {
          acc[key] = state[key as keyof typeof state];
        } else if (typeof state[key as keyof typeof state] === 'function') {
          // Include function names for reference
          acc[key] = '[Function]';
        }
        return acc;
      }, {} as Record<string, any>);
      
      setRawStoreState(audioRawState);
    });
  }, [isDebug]);

  // Add audio event logging
  const logAudioEvent = (event: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS format
    setAudioEvents(prev => {
      const newEvents = [`${timestamp} - ${event}`, ...prev];
      // Keep only the last 20 events
      return newEvents.slice(0, 20);
    });
  };
  
  // Monitor audio state changes
  useEffect(() => {
    logAudioEvent(`Audio loop changed: ${audioState.currentLoop || 'none'}`);
  }, [audioState.currentLoop]);
  
  useEffect(() => {
    logAudioEvent(`Music state changed: ${audioState.isPlaying ? 'playing' : 'stopped'} - ${audioState.currentSong || 'none'}`);
  }, [audioState.isPlaying, audioState.currentSong]);
  
  useEffect(() => {
    logAudioEvent(`Volume changed: ${audioState.volume.toFixed(2)}`);
  }, [audioState.volume]);

  // Add manual audio controls for debugging
  const handleInitializeAudio = useCallback(() => {
    logAudioEvent('Manual audio initialization requested');
    // Access the raw store to get the initializeAudioContext function
    import('@/store/store').then(module => {
      const store = module.useStore.getState();
      store.initializeAudioContext().then(() => {
        logAudioEvent('Audio context initialized');
      }).catch(error => {
        logAudioEvent(`Audio initialization error: ${error.message}`);
      });
    });
  }, []);
  
  const handlePlayAmbientSound = useCallback(() => {
    logAudioEvent('Manual ambient sound requested');
    audioState.loopSound('flashcard-loop-catfootsteps');
  }, [audioState]);
  
  const handleStopAllAudio = useCallback(() => {
    logAudioEvent('Manual stop all audio requested');
    audioState.stopAllLoops();
  }, [audioState]);
  
  const handleResetAudioState = useCallback(() => {
    logAudioEvent('Manual audio state reset requested');
    // First stop all audio
    audioState.stopAllLoops();
    
    // Then reinitialize after a short delay
    setTimeout(() => {
      import('@/store/store').then(module => {
        const store = module.useStore.getState();
        store.initializeAudioContext().then(() => {
          logAudioEvent('Audio context reinitialized');
        });
      });
    }, 500);
  }, [audioState]);

  // Don't render anything if not in debug mode
  if (!isDebug) return null;

  // Extract audio state for display
  const audioStateForDisplay = {
    isPlaying: audioState.isPlaying,
    currentSong: audioState.currentSong,
    currentLoop: audioState.currentLoop,
    volume: audioState.volume,
  };
  
  // Count active audio sources
  const audioSourceCount = {
    musicSources: useStore()._MUSIC_SOURCE?.size || 0,
    loopSources: useStore()._LOOP_SOURCES?.size || 0,
    bufferCache: useStore()._bufferCache?.size || 0,
  };
  
  // Get active loop names
  const activeLoops = useStore()._LOOP_SOURCES ? 
    Array.from(useStore()._LOOP_SOURCES.keys()) : 
    [];

  // Debug panel UI
  return (
    <div className={cn(
      "fixed bottom-0 right-0 z-50 bg-black/80 text-white p-4 rounded-tl-lg w-96 max-h-[80vh] overflow-auto transition-all duration-300 transform",
      isOpen ? "translate-y-0" : "translate-y-full"
    )}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
      >
        {isOpen ? "Close" : "Debug"}
      </button>
      
      <h2 className="text-lg font-bold mb-2">Debug Panel</h2>
      
      {/* Add manual audio controls */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h3 className="text-sm font-bold mb-2">Audio Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleInitializeAudio}
            className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
          >
            Init Audio
          </button>
          <button 
            onClick={handlePlayAmbientSound}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded"
          >
            Play Ambient
          </button>
          <button 
            onClick={handleStopAllAudio}
            className="bg-red-600 text-white px-2 py-1 text-xs rounded"
          >
            Stop All Audio
          </button>
          <button 
            onClick={handleResetAudioState}
            className="bg-yellow-600 text-white px-2 py-1 text-xs rounded"
          >
            Reset Audio
          </button>
        </div>
      </div>
      
      {/* Audio State */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h3 className="text-sm font-bold mb-2">Audio State</h3>
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(displayAudioState, null, 2)}
        </pre>
      </div>
      
      {/* Audio Events Log */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h3 className="text-sm font-bold mb-2">Audio Events</h3>
        <div className="max-h-40 overflow-y-auto">
          {audioEvents.map((event, index) => (
            <div key={index} className="text-xs mb-1 font-mono">
              {event}
            </div>
          ))}
        </div>
      </div>
      
      {/* Game State */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h3 className="text-sm font-bold mb-2">Game State</h3>
        <div className="text-xs">
          <div>Flashcards Open: {gameState.isFlashcardsOpen ? 'Yes' : 'No'}</div>
          <div>Room ID: {gameState.flashcardRoomId || 'None'}</div>
          <div>Game In Progress: {gameState.isGameInProgress ? 'Yes' : 'No'}</div>
        </div>
      </div>
      
      {/* Raw Store State (if in debug mode) */}
      {isDebug && rawStoreState && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <h3 className="text-sm font-bold mb-2">Raw Audio Store</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(rawStoreState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DebugPanel