TODO: 
[ x ] lazy load remove
[x] no prop drilling - okay take a note of page.tsx and all its children components, and note which global state values we store in the global zustand store and make sure we are not prop drilling any values into the child components. 

# AudioContext and MusicPlayerContext Migration Plan

## Overview
This plan outlines the steps to migrate the AudioContext and MusicPlayerContext from React Context API to Zustand state management. This migration will consolidate audio and music player functionality into a single `AudioSlice` within the main Zustand store, following the existing pattern used for UI, Game, and User stores.

## Current State Analysis
1. **AudioContext** provides:
   - Audio playback functionality (play, stop, loop)
   - Volume control
   - Sound effects management
   - Music playback
   - Audio buffer caching
   - Error handling with user-friendly messages
   - Performance monitoring (in development mode)

2. **MusicPlayerContext** provides:
   - ~~Auto-play settings~~ (Unused in current implementation)
   - Music player UI state

3. **Dependencies**:
   - `useAudioTransitions` hook depends on AudioContext (will be removed)
   - Multiple components use both contexts

## Migration Steps

### 1. Extend the Main Store Structure
- [ ] Add an audio slice to the existing store in `store.ts`:
  ```typescript
  // Define the AudioSlice interface
  interface AudioSlice {
    // Audio state
    isPlayingSong: boolean;
    currentSong: string | null;
    currentLoop: string | null;
    masterVolume: number;
    
    // Audio context references (not serializable - handled internally)
    _audioContext: AudioContext | null;
    _masterGainNode: GainNode | null;
    _bufferCache: Map<string, AudioBuffer>;
    
    // Basic audio actions
    playMusic: (src: string, startPlayback?: boolean, onEnded?: () => void) => void;
    stopMusic: () => void;
    playSound: (soundName: string) => void;
    loopSound: (soundName: string) => Promise<void>;
    stopLoopSound: (soundName: string) => void;
    stopAllLoops: () => Promise<void>;
    getCurrentLoop: () => string | null;
    setMasterVolume: (newVolume: number) => void;
    
    // Audio context management
    initializeAudioContext: () => Promise<AudioContext | null>;
    loadAudioBuffer: (url: string) => Promise<AudioBuffer>;
    
    // Transition actions (replacing useAudioTransitions)
    handleFlashcardsTransition: (isOpen: boolean) => Promise<void>;
  }
  
  // Update the Store type
  type Store = UISlice & UserSlice & GameSlice & AudioSlice;
  ```

### 2. Implement Audio Slice in the Store
- [ ] Add the audio state and actions to the main store:
  ```typescript
  // In store.ts
  export const useStore = create<Store>()(
    devtools(
      (set, get) => ({
        // Audio, UI, User, Game slices

        //************************************************************************************************//
        //************************************** Audio State *********************************************//
        //************************************************************************************************//
        
        // Audio state
        isPlayingSong: false,
        currentSong: null,
        currentLoop: null,
        masterVolume: 0.5,
        
        // Non-serializable audio references (prefixed with _ to indicate internal use)
        _audioContext: null,
        _masterGainNode: null,
        _bufferCache: new Map<string, AudioBuffer>(),
        
        // Constants
        _MUSIC_SOURCE: new Map<string, AudioBufferSourceNode>(),
        _LOOP_SOURCES: new Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>(),
        _BUFFER_CACHE_LIMIT: 20, // MB
        _VOLUME_COEFFICIENTS: {
          music: 1.0,  // Music at full volume
          sfx: 0.5,    // SFX at half volume
          ambient: 0.75  // Ambient at 75% volume
        },
        _SOUND_MAPPINGS: {
          'flashcard-door-open': 'sfx',
          'flashcard-door-closed': 'sfx',
          'flashcard-loop-catfootsteps': 'ambient',
          'elevenlabs-response': 'sfx',
          // ... other sound mappings
        },
        
        // Error handling
        _handleAudioError: (error: Error, context: string) => {
          console.error(`🎵 [AudioContext] ${context}:`, error);
          
          // Check for specific error types
          if (error instanceof DOMException && error.name === 'NotAllowedError') {
            toast.error('Please interact with the page first to enable audio.');
          } else if (error.name === 'EncodingError') {
            toast.error('This audio format is not supported by your browser.');
          } else {
            toast.error('Failed to play audio. Please try again.');
          }
        },
        
        // Audio context initialization
        initializeAudioContext: async () => {
          const state = get();
          
          try {
            // Check if we already have a running context
            if (state._audioContext?.state === 'running') {
              return state._audioContext;
            }

            // Try to resume suspended context
            if (state._audioContext?.state === 'suspended') {
              await state._audioContext.resume();
              return state._audioContext;
            }

            // Create new context if needed
            if (typeof window !== 'undefined') {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioContextClass({
                latencyHint: 'interactive',
                sampleRate: 44100
              });
              
              await ctx.resume();
              
              // Create master gain node
              const masterGain = ctx.createGain();
              masterGain.connect(ctx.destination);
              masterGain.gain.value = state.masterVolume;
              
              // Update state with new context and gain node
              set({ 
                _audioContext: ctx,
                _masterGainNode: masterGain
              });
              
              // Monitor performance in development
              if (process.env.NODE_ENV === 'development') {
                if (ctx.baseLatency > 0.025) {
                  console.warn('High audio latency detected:', ctx.baseLatency);
                }
                
                if ((ctx as any).getOutputTimestamp) {
                  const timestamp = (ctx as any).getOutputTimestamp();
                  if (timestamp.contextTime > timestamp.performanceTime) {
                    console.warn('Audio buffer underrun detected');
                  }
                }
              }
              
              return ctx;
            }
            
            return null;
          } catch (error) {
            state._handleAudioError(error as Error, 'Audio context initialization failed');
            return null;
          }
        },
        
        // Load and cache audio buffer
        loadAudioBuffer: async (url: string) => {
          const state = get();
          
          // Check if buffer is already cached
          if (state._bufferCache.has(url)) {
            return state._bufferCache.get(url)!;
          }
          
          // Check cache size before adding new buffer
          let totalSize = 0;
          for (const buffer of state._bufferCache.values()) {
            totalSize += buffer.length * buffer.numberOfChannels * 4; // 4 bytes per sample
          }
          
          if (totalSize > state._BUFFER_CACHE_LIMIT * 1024 * 1024) {
            // Clear oldest entries if cache is too large
            const oldestKey = state._bufferCache.keys().next().value;
            if (oldestKey) {
              state._bufferCache.delete(oldestKey);
            }
          }
          
          const ctx = await state.initializeAudioContext();
          if (!ctx) throw new Error('Failed to initialize audio context');

          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            
            // Cache the decoded buffer
            state._bufferCache.set(url, audioBuffer);
            
            return audioBuffer;
          } catch (error) {
            state._handleAudioError(error as Error, `Failed to load audio: ${url}`);
            throw error;
          }
        },
        
        // Basic audio actions
        playMusic: async (src, startPlayback = true, onEnded) => {
          const state = get();
          
          if (!startPlayback) {
            state.stopMusic();
            return null;
          }

          try {
            if (state._MUSIC_SOURCE.size > 0) {
              state.stopMusic();
            }

            const audioBuffer = await state.loadAudioBuffer(src);
            const ctx = await state.initializeAudioContext();
            if (!ctx) throw new Error('No audio context');

            set({ 
              isPlayingSong: true,
              currentSong: src
            });

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;

            // Add gain node with music coefficient
            const gainNode = ctx.createGain();
            gainNode.gain.value = state.masterVolume * state._VOLUME_COEFFICIENTS.music;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(state._masterGainNode!);

            state._MUSIC_SOURCE.set(src, source);
            
            if (startPlayback) {
              source.start(0);
            }

            source.onended = () => {
              state._MUSIC_SOURCE.delete(src);
              set({
                isPlayingSong: false,
                currentSong: null
              });
              onEnded?.();
            };

            return source;
          } catch (error) {
            state._handleAudioError(error as Error, 'Error playing music');
            return null;
          }
        },
        
        stopMusic: () => {
          const state = get();
          
          state._MUSIC_SOURCE.forEach((source, url) => {
            try {
              source.onended = null;
              source.stop();
              source.disconnect();
              state._MUSIC_SOURCE.delete(url);
            } catch (error) {
              state._handleAudioError(error as Error, 'Error stopping music');
            }
          });

          set({
            isPlayingSong: false,
            currentSong: null
          });
        },
        
        playSound: async (soundName) => {
          const state = get();
          
          try {
            const ctx = await state.initializeAudioContext();
            if (!ctx) return;
            
            const buffer = await state.loadAudioBuffer(`/audio/${soundName}.mp3`);
            
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            
            // Get appropriate coefficient
            const category = state._SOUND_MAPPINGS[soundName] || 'sfx';
            const coefficient = state._VOLUME_COEFFICIENTS[category];
            
            // Create gain node with coefficient
            const localGain = ctx.createGain();
            localGain.gain.value = state.masterVolume * coefficient;
            
            // Connect nodes
            source.connect(localGain);
            localGain.connect(state._masterGainNode!);
            
            // Fade in
            localGain.gain.setValueAtTime(0, ctx.currentTime);
            localGain.gain.linearRampToValueAtTime(coefficient * state.masterVolume, ctx.currentTime + 0.02);
            
            source.start();
            
            // Fade out
            const duration = buffer.duration;
            localGain.gain.setValueAtTime(coefficient * state.masterVolume, ctx.currentTime + duration - 0.05);
            localGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
            
            source.onended = () => {
              source.disconnect();
              localGain.disconnect();
            };
          } catch (error) {
            state._handleAudioError(error as Error, 'Failed to play sound');
          }
        },
        
        loopSound: async (soundName) => {
          const state = get();
          const normalizedName = soundName.replace('/audio/', '').replace(/\.(mp3|wav)$/, '');
          const fullPath = `/audio/${normalizedName}.wav`;
          
          // Only one loop can be active at a time
          if (state._LOOP_SOURCES.has(fullPath)) {
            return;
          }

          try {
            const ctx = await state.initializeAudioContext();
            if (!ctx) throw new Error('Audio context not initialized');

            const audioBuffer = await state.loadAudioBuffer(fullPath);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            // Apply the appropriate volume coefficient
            const category = state._SOUND_MAPPINGS[normalizedName] || 'ambient';
            const coefficient = state._VOLUME_COEFFICIENTS[category];

            // Create local gain with fixed coefficient
            const gainNode = ctx.createGain();
            gainNode.gain.value = state.masterVolume * coefficient;

            // Connect directly to master
            source.connect(gainNode);
            gainNode.connect(state._masterGainNode!);

            state._LOOP_SOURCES.set(fullPath, { source, gainNode });
            source.start(0);
            
            // Update state with current loop
            set({ currentLoop: fullPath });

          } catch (error) {
            state._handleAudioError(error as Error, 'Failed to start audio loop');
          }
        },
        
        stopLoopSound: (soundName) => {
          const state = get();
          const normalizedName = soundName.replace('/audio/', '').replace(/\.(mp3|wav)$/, '');
          const fullPath = `/audio/${normalizedName}.wav`;
          
          const audio = state._LOOP_SOURCES.get(fullPath);
          if (audio) {
            try {
              audio.source.stop();
              audio.source.disconnect();
              audio.gainNode.disconnect();
              state._LOOP_SOURCES.delete(fullPath);
              
              // Clear current loop if it matches
              if (state.currentLoop === fullPath) {
                set({ currentLoop: null });
              }
            } catch (error) {
              state._handleAudioError(error as Error, 'Error stopping ambient sound');
            }
          }
        },
        
        stopAllLoops: async () => {
          const state = get();
          
          state._LOOP_SOURCES.forEach((audio, name) => {
            try {
              audio.source.stop();
              audio.source.disconnect();
              audio.gainNode.disconnect();
              state._LOOP_SOURCES.delete(name);
            } catch (error) {
              state._handleAudioError(error as Error, 'Error stopping ambient sound');
            }
          });
          
          // Clear current loop
          set({ currentLoop: null });
        },
        
        getCurrentLoop: () => {
          return get().currentLoop;
        },
        
        setMasterVolume: (newVolume) => {
          const state = get();
          
          if (!state._masterGainNode || !state._audioContext) {
            // Just update the state if audio context isn't initialized
            set({ masterVolume: newVolume });
            return;
          }

          const now = state._audioContext.currentTime;
          state._masterGainNode.gain.cancelScheduledValues(now);
          state._masterGainNode.gain.linearRampToValueAtTime(newVolume, now + 0.1);
          
          // Update state
          set({ masterVolume: newVolume });
        },
        
        // Transition actions (replacing useAudioTransitions)
        handleFlashcardsTransition: async (isOpen) => {
          // Internal transition tracking - no need for global state
          const state = get();
          
          try {
            if (isOpen) {
              // Transition to flashcards open
              await state.stopAllLoops();
              state.playSound('flashcard-door-open');
            } else {
              // Transition to flashcards closed
              state.playSound('flashcard-door-closed');
              await new Promise(resolve => setTimeout(resolve, 500));
              await state.loopSound('flashcard-loop-catfootsteps');
            }
          } catch (error) {
            state._handleAudioError(error as Error, '[AudioTransition] Error');
          }
        }
      }),
      {
        // Exclude non-serializable fields from devtools
        serialize: {
          options: {
            map: new Map([
              ['_audioContext', '__excluded__'],
              ['_masterGainNode', '__excluded__'],
              ['_bufferCache', '__excluded__'],
              ['_MUSIC_SOURCE', '__excluded__'],
              ['_LOOP_SOURCES', '__excluded__']
            ])
          }
        }
      }
    )
  )
  ```
- [ ] Port all audio context functionality
- [ ] Add music player state and actions
- [ ] Ensure browser environment checks for SSR compatibility
- [ ] Add proper TypeScript types

### 3. Create Selectors in selectors.ts
- [ ] Add audio selectors to `store/selectors.ts`:
  ```typescript
  // Consolidated audio selector
  export const useAudio = () => {
    const isPlayingSong = useStore((state) => state.isPlayingSong);
    const currentSong = useStore((state) => state.currentSong);
    const currentLoop = useStore((state) => state.currentLoop);
    const masterVolume = useStore((state) => state.masterVolume);
    
    // Basic actions
    const playMusic = useStore((state) => state.playMusic);
    const stopMusic = useStore((state) => state.stopMusic);
    const playSound = useStore((state) => state.playSound);
    const loopSound = useStore((state) => state.loopSound);
    const stopLoopSound = useStore((state) => state.stopLoopSound);
    const stopAllLoops = useStore((state) => state.stopAllLoops);
    const getCurrentLoop = useStore((state) => state.getCurrentLoop);
    const setMasterVolume = useStore((state) => state.setMasterVolume);
    
    // Transition actions
    const handleFlashcardsTransition = useStore((state) => state.handleFlashcardsTransition);
    
    return {
      // State
      isPlayingSong,
      currentSong,
      currentLoop,
      masterVolume,
      
      // Basic actions
      playMusic,
      stopMusic,
      playSound,
      loopSound,
      stopLoopSound,
      stopAllLoops,
      getCurrentLoop,
      setMasterVolume,
      
      // Transition actions
      handleFlashcardsTransition
    };
  }
  
  // Individual selectors for specific needs
  export const useAudioPlayer = () => ({
    isPlayingSong: useStore(state => state.isPlayingSong),
    currentSong: useStore(state => state.currentSong),
    masterVolume: useStore(state => state.masterVolume),
    playMusic: useStore(state => state.playMusic),
    stopMusic: useStore(state => state.stopMusic),
    setMasterVolume: useStore(state => state.setMasterVolume)
  });
  ```

### 4. Create Compatibility Layer
- [ ] Create compatibility wrappers for existing contexts:
  - [ ] Update `contexts/AudioContext.tsx` to use Zustand store internally
  - [ ] Update `contexts/MusicPlayerContext.tsx` to use Zustand store internally (or remove if unused)
  - [ ] Ensure backward compatibility for existing components

### 5. Update Component Dependencies
- [ ] Identify all components using AudioContext or MusicPlayerContext
- [ ] Update imports to use new selectors
- [ ] Test each component with the new store

### 6. Update Hooks and Remove Redundant Code
- [ ] Remove `useAudioTransitions.ts` hook entirely
- [ ] Update components that use this hook to use the store directly:
  ```typescript
  // In ankiclinic/page.tsx
  
  // Before:
  const { 
    initializeAmbientSound, 
    stopAllAudio,
    isAudioTransitionInProgress 
  } = useAudioTransitions({
    isFlashcardsOpen,
    isLoading,
    isMounted: true
  });
  
  // After:
  const { 
    loopSound, 
    stopAllLoops, 
    handleFlashcardsTransition
  } = useAudio();
  
  // Effect to handle flashcards transitions
  useEffect(() => {
    if (!isLoading) {
      handleFlashcardsTransition(isFlashcardsOpen);
    }
  }, [isFlashcardsOpen, isLoading, handleFlashcardsTransition]);
  
  // Initialize ambient sound on mount
  useEffect(() => {
    if (!isLoading && !isFlashcardsOpen) {
      loopSound('flashcard-loop-catfootsteps');
    }
    
    return () => {
      stopAllLoops();
    };
  }, [isLoading, isFlashcardsOpen, loopSound, stopAllLoops]);
  ```

### 7. Handle Browser-Specific APIs
- [ ] Ensure all browser-specific code has proper checks:
  ```typescript
  // Example of browser check
  if (typeof window !== 'undefined') {
    // Browser-specific code
  }
  ```
- [ ] Use dynamic imports with `ssr: false` for components with audio dependencies
- [ ] Add initialization logic for browser environment
- [ ] Handle WebAudio API browser compatibility issues

### 8. Add Cleanup Logic
- [ ] Implement a store cleanup function:
  ```typescript
  // In store.ts
  useEffect(() => {
    // Initialize audio context when store is first used in browser
    const state = get();
    state.initializeAudioContext();
    
    // Cleanup function
    return () => {
      const state = get();
      state.stopAllLoops();
      state.stopMusic();
      
      // Close audio context
      if (state._audioContext) {
        state._audioContext.close();
      }
      
      // Clear references
      set({
        _audioContext: null,
        _masterGainNode: null,
        _MUSIC_SOURCE: new Map(),
        _LOOP_SOURCES: new Map()
      });
    };
  }, []);
  ```
- [ ] Add this to a store initialization function

### 9. Testing Plan
- [ ] Test audio playback functionality
- [ ] Test music player controls
- [ ] Test volume controls
- [ ] Test sound effects
- [ ] Test looping sounds
- [ ] Verify SSR compatibility
- [ ] Test error handling
- [ ] Test performance monitoring
- [ ] Test browser compatibility

### 10. Documentation Updates
- [ ] Update README-STATE.md with new store information
- [ ] Mark AudioContext and MusicPlayerContext as migrated
- [ ] Document any breaking changes or API differences
- [ ] Document the audio buffer caching system
- [ ] Document error handling approach
- [ ] Document volume coefficient system

### 11. Cleanup
- [ ] Remove deprecated context providers from app layout
- [ ] Remove unused code and imports
- [ ] Update any remaining references to old contexts

## Implementation Considerations
1. **Browser Environment**: Ensure all Web Audio API usage is wrapped in browser environment checks
2. **Performance**: Use selective subscriptions to prevent unnecessary re-renders
3. **SSR Compatibility**: Handle server-side rendering properly
4. **Error Handling**: Maintain robust error handling for audio operations
5. **Memory Management**: Ensure proper cleanup of audio resources
6. **Store Organization**: Keep the store organized by grouping related state and actions
7. **Non-Serializable State**: Use prefixed properties (e.g., `_audioContext`) for non-serializable state and exclude them from devtools serialization
8. **Volume Management**: Maintain the volume coefficient system for different sound categories

## Potential Challenges
1. Managing audio buffer caching in Zustand
2. Handling audio context initialization timing
3. Ensuring proper cleanup of audio resources
4. Maintaining backward compatibility during transition
5. Managing external audio resources and references that can't be stored directly in Zustand
6. Handling browser compatibility issues with Web Audio API
7. Ensuring proper error handling across all audio operations

-----
## Cursor Notes

#### Prompts
` Do not apply code changes, just analyze the issue and respond to the question`

#### Add new branch to worktree
add new branch for Cursor to compare: 
`git worktree add localstate-compare`

remove it before pushing back up 
`git worktree remove localstate-compare`

#### Create diff file for Cursor

To create a detailed diff against `main` with context:
```
git diff --full-index main > branch-diff-full.diff
```

To feed the diff back into Cursor:
1. Create the diff file
2. Open the diff file in Cursor
3. Ask Cursor to analyze the changes