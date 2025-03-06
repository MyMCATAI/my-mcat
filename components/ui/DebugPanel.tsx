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
      setIsOpen(true) // Automatically open the panel when debug=true
      document.body.classList.add('debug-mode')
      
      // Store debug mode in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('debugMode', JSON.stringify(true));
        console.log('[DEBUG] Debug mode enabled via URL parameter');
      }
    } else {
      // Check localStorage as a fallback
      if (typeof window !== 'undefined') {
        const storedDebugMode = localStorage.getItem('debugMode');
        if (storedDebugMode === 'true' || storedDebugMode === '"true"') {
          setIsDebug(true);
          setIsOpen(true);
          document.body.classList.add('debug-mode');
          console.log('[DEBUG] Debug mode enabled via localStorage');
          return;
        }
      }
      
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

  // Move these hooks above the conditional return
  // Get store data for debugging
  const store = useStore();
  
  // Extract audio state for display
  const audioStateForDisplay = {
    isPlaying: audioState.isPlaying,
    currentSong: audioState.currentSong,
    currentLoop: audioState.currentLoop,
    volume: audioState.volume,
  };
  
  // Count active audio sources
  const audioSourceCount = {
    musicSources: store._MUSIC_SOURCE?.size || 0,
    loopSources: store._LOOP_SOURCES?.size || 0,
    bufferCache: store._bufferCache?.size || 0,
  };
  
  // Get active loop names
  const activeLoops = store._LOOP_SOURCES ? 
    Array.from(store._LOOP_SOURCES.keys()) : 
    [];

  // Don't render anything if not in debug mode
  if (!isDebug) return null;

  // Debug panel UI
  return (
    <>
      {/* Always visible toggle button when in debug mode */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[9999] bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center justify-center"
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        {isOpen ? "×" : "Debug"}
      </button>
      
      <div className={cn(
        "fixed bottom-0 right-0 z-[9999] bg-black/90 text-white p-4 rounded-tl-lg w-96 max-h-[80vh] overflow-auto transition-all duration-300 transform shadow-xl",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
      style={{ pointerEvents: 'auto' }}>
        <h2 className="text-lg font-bold mb-2 flex justify-between items-center">
          <span>Debug Panel</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
        </h2>
        
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
        
        {/* Route Information */}
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <h3 className="text-sm font-bold mb-2">Route Information</h3>
          <div className="text-xs mb-1">
            <strong>Current Path:</strong> {pathname}
          </div>
          <div className="text-xs mb-1">
            <strong>URL Parameters:</strong>
          </div>
          <div className="text-xs mb-2 font-mono">
            {searchParams ? (
              Array.from(searchParams.entries()).map(([key, value]) => (
                <div key={key} className="pl-2">
                  {key}: {value}
                </div>
              ))
            ) : (
              <div className="pl-2">No parameters</div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('debug', 'true');
                window.history.pushState({}, '', url.toString());
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
            >
              Add debug=true
            </button>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('debug');
                window.history.pushState({}, '', url.toString());
                window.location.reload();
              }}
              className="bg-yellow-600 text-white px-2 py-1 text-xs rounded"
            >
              Remove debug
            </button>
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
    </>
  )
}

export default DebugPanel