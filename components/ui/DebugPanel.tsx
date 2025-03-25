"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUI, useUser, useGame, useAudio, useVocab } from '@/store/selectors'
import { useUserStore } from '@/store/slices/userSlice'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  
  /* ---- State ----- */
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const [isDebug, setIsDebug] = useState(false)
  
  
  // Zustand state
  const uiState = useUI()
  const userState = useUser()
  const gameState = useGame()
  const audioState = useAudio()
  const vocabState = useVocab()

  /* --- Effects --- */
  // Simple debug mode logic - only use URL parameter
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    
    // Add a direct check for the debug parameter in URL
    const urlContainsDebug = typeof window !== 'undefined' && window.location.href.includes('debug=true');
    
    if (debugValue === 'true' || urlContainsDebug) {
      setIsDebug(true)
      document.body.classList.add('debug-mode')
    } else {
      // Any other value (including null) - disable debug mode
      setIsDebug(false)
      document.body.classList.remove('debug-mode')
    }
  }, [searchParams])


  // Create a safe version of audio state for display (without functions)
  const displayAudioState = {
    // Basic state
    isPlaying: audioState.isPlaying,
    currentSong: audioState.currentSong,
    currentSongTitle: audioState.getCurrentSongTitle ? audioState.getCurrentSongTitle() : 'Unknown',
    currentLoop: audioState.currentLoop,
    volume: audioState.volume,
    songQueue: Array.isArray(audioState.songQueue) ? audioState.songQueue : [],
    queueLength: Array.isArray(audioState.songQueue) ? audioState.songQueue.length : 0,
    
    // Advanced state
    currentMusic: audioState.currentMusic,
    masterVolume: audioState.masterVolume,
    currentSongIndex: audioState.currentSongIndex,
    audioContext: audioState.audioContext ? 'initialized' : 'null',
    
    // Audio sources
    sources: {
      music: audioState.musicSource ? 'active' : 'null',
      loop: audioState.loopSource ? 'active' : 'null',
      voice: audioState.voiceSource ? 'active' : 'null',
    },
    
    // Gain nodes
    gainNodes: {
      master: audioState.masterGainNode ? 'active' : 'null',
      music: audioState.musicGainNode ? 'active' : 'null',
      sfx: audioState.sfxGainNode ? 'active' : 'null',
      loop: audioState.loopGainNode ? 'active' : 'null',
      voice: audioState.voiceGainNode ? 'active' : 'null'
    }
  };

  // Function to stringify with sorted keys - using a custom serialization approach
  const stringifySorted = (obj: any) => {
    // First, build a clean object removing functions and preserving order
    const prepareObject = (input: any): any => {
      // Handle primitives, null and undefined
      if (input === null || input === undefined || typeof input !== 'object') {
        return input;
      }
      
      // Handle arrays
      if (Array.isArray(input)) {
        return input.map(item => prepareObject(item));
      }
      
      // Create an object without functions, sorting keys alphabetically
      const result: any = {};
      
      // Get sorted keys
      const keys = Object.keys(input).sort((a, b) => 
        a.localeCompare(b, 'en', { sensitivity: 'base' })
      );
      
      // Add keys in sorted order
      keys.forEach(key => {
        if (typeof input[key] !== 'function') {
          result[key] = prepareObject(input[key]);
        }
      });
      
      return result;
    };
    
    // Manually handle JSON string creation with sorted keys
    const toSortedJSONString = (input: any, indent = 0): string => {
      // Handle primitives, null and undefined
      if (input === null) return 'null';
      if (input === undefined) return 'undefined';
      if (typeof input !== 'object') {
        if (typeof input === 'string') return `"${input.replace(/"/g, '\\"')}"`;
        return String(input);
      }
      
      // Handle arrays
      if (Array.isArray(input)) {
        if (input.length === 0) return '[]';
        let result = '[\n';
        const spaces = ' '.repeat(indent + 2);
        
        input.forEach((item, index) => {
          result += spaces + toSortedJSONString(item, indent + 2);
          if (index < input.length - 1) result += ',';
          result += '\n';
        });
        
        result += ' '.repeat(indent) + ']';
        return result;
      }
      
      // Handle objects - keys should already be sorted by prepareObject
      const keys = Object.keys(input);
      
      if (keys.length === 0) return '{}';
      
      let result = '{\n';
      const spaces = ' '.repeat(indent + 2);
      
      keys.forEach((key, index) => {
        result += spaces + `"${key}": ` + toSortedJSONString(input[key], indent + 2);
        if (index < keys.length - 1) result += ',';
        result += '\n';
      });
      
      result += ' '.repeat(indent) + '}';
      return result;
    };
    
    try {
      // Clean the object (removes functions and sorts keys)
      const preparedObj = prepareObject(obj);
      
      // Generate the sorted JSON string
      return toSortedJSONString(preparedObj, 0);
    } catch (err) {
      // Fall back to standard JSON
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') return undefined;
        return value;
      }, 2);
    }
  };

  // Don't render anything if not in debug mode
  if (!isDebug) {
    return null;
  }
  
  // Create a custom version of userState for display
  const userStateForDisplay = (() => {
    // If userInfo doesn't exist, just return the original state
    if (!userState.userInfo) return userState;
    
    // Extract onboardingInfo from userInfo if it exists
    const onboardingInfo = userState.userInfo.onboardingInfo || null;
    
    // Create a clean copy, explicitly excluding any root-level onboardingComplete
    const { onboardingComplete: _, ...cleanState } = userState as any;
    
    return {
      ...cleanState,
      // Move onboardingInfo to top level for better visibility
      onboardingInfo
    };
  })();

  // Debug panel UI
  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded-lg max-w-[400px] max-h-[80vh] overflow-auto text-xs">
      <h3 className="text-lg font-bold mb-2">Debug Panel</h3>
      
      <div className="grid grid-cols-1 gap-2">
        <div>
          <h4 className="font-bold">UI State</h4>
          <pre>{stringifySorted({
            theme: uiState.theme,
            window: uiState.window,
            currentRoute: uiState.currentRoute
          })}</pre>
        </div>
        
        <hr className="border-white/30 my-2" />
        
        <div>
          <h4 className="font-bold">User State</h4>
          <pre>{stringifySorted(userStateForDisplay)}</pre>
        </div>
        
        <hr className="border-white/30 my-2" />
        
        <div>
          <h4 className="font-bold">Audio State</h4>
          <pre>{stringifySorted(displayAudioState)}</pre>
        </div>
        
        <hr className="border-white/30 my-2" />
        
        <div>
          <h4 className="font-bold">Game State</h4>
          <pre>{stringifySorted(gameState)}</pre>
        </div>
        
        <hr className="border-white/30 my-2" />
        
        <div>
          <h4 className="font-bold">Vocab State</h4>
          <pre>{stringifySorted(vocabState)}</pre>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel