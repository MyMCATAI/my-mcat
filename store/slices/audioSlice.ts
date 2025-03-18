import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ThemeType } from './uiSlice';



//========================= Types ===============================
interface VolumeCoefficients {
  master: number;
  music: number;
  sfx: number;
  loop: number;
  voice: number;
}
// Default volume settings
const DEFAULT_VOLUMES: VolumeCoefficients = {
  master: 0.7,
  music: 0.7,
  sfx: 0.5,  // Increase to full volume for better audibility
  loop: 0.5,
  voice: 0.9
};

interface AudioState {
  masterVolume: number;
  currentMusic: string | null;
  currentLoop: string | null;
  isPlaying: boolean;
  audioContext: AudioContext | null;
  musicSource: AudioBufferSourceNode | null;
  loopSource: AudioBufferSourceNode | null;
  voiceSource: AudioBufferSourceNode | null;
  bufferCache: Map<string, AudioBuffer>;
  // Player state
  volume: number;
  currentSong: string | null;
  songQueue: string[];
  currentSongIndex: number;
  // Audio nodes for proper volume control
  masterGainNode: GainNode | null;
  musicGainNode: GainNode | null;
  sfxGainNode: GainNode | null;
  loopGainNode: GainNode | null;
  voiceGainNode: GainNode | null;

  // Sound Mappings for SFX
  _SOUND_MAPPINGS: Record<string, string>;
  // Track loading state to prevent duplicate playback
  _isLoopLoading: boolean;
  _pendingLoopName: string | null;
}

interface AudioActions {
  setMasterVolume: (volume: number) => void;
  playMusic: (trackUrl: string) => Promise<void>;
  stopMusic: () => void;
  playSound: (sfxName: string) => Promise<void>;
  playLoop: (loopName: string) => Promise<void>;
  stopLoop: () => void;
  playVoice: (audioBase64: string) => Promise<void>;
  stopVoice: () => void;
  loadAudioBuffer: (url: string) => Promise<AudioBuffer>;
  initializeAudioContext: () => Promise<void>;
  // Enhanced player controls
  setVolume: (volume: number) => void;
  skipToNext: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  handleThemeChange: (newTheme: ThemeType, wasPlaying?: boolean) => Promise<void>;
  getCurrentSongTitle: () => string;
  setSongQueue: (queue: string[]) => void;
}

// Helper function for sound paths
const getAudioPath = (fileName: string, type: 'music' | 'sfx' | 'loop'): string => {
  let path = '';
  if (type === 'music') {
    path = fileName; // Music URLs are already hosted
  } else {
    path = `/audio/${fileName}.${type === 'loop' ? 'wav' : 'mp3'}`; // SFX & Loop are in public/audio
  }
  console.log(`[AudioSlice] Generated audio path for ${fileName} (${type}): ${path}`);
  return path;
};

// Helper function to extract song title from URL
const getSongTitleFromUrl = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/music\/([^.]+)/);
    return match ? match[1] : 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
};

//========================= Initialization ===============================


export const useAudioStore = create<AudioState & AudioActions>()(
  devtools((set, get) => ({
    masterVolume: DEFAULT_VOLUMES.master,
    isPlaying: false,
    currentMusic: null,
    currentLoop: null,
    audioContext: null,
    musicSource: null,
    loopSource: null,
    voiceSource: null,
    bufferCache: new Map(),
    
    // Player state
    volume: DEFAULT_VOLUMES.music,
    currentSong: null,
    songQueue: [],
    currentSongIndex: 0,
    
    // Audio nodes
    masterGainNode: null,
    musicGainNode: null,
    sfxGainNode: null,
    loopGainNode: null,
    voiceGainNode: null,

    // Sound mappings: maps SFX names to paths
    _SOUND_MAPPINGS: {
      'flashcard-door-open': 'flashcard-door-open',
      'flashcard-door-closed': 'flashcard-door-closed',
      'flashcard-loop-catfootsteps': 'flashcard-loop-catfootsteps',
      'elevenlabs-response': 'elevenlabs-response',
      'click': 'flashcard-select',
      'hover': 'hover',
      'success': 'correct',
      'error': 'whoosh',
      'notification': 'notification',
      'cardFlip': 'cardFlip',
      'levelUp': 'levelUp',
      'coin': 'coin',
      'achievement': 'achievement',
      'flashcard-startup': 'flashcard-startup',
      'flashcard-spacebar-reveal': 'flashcard-spacebar-reveal',
      'flashcard-select': 'flashcard-select',
      'correct': 'correct',
      'whoosh': 'whoosh',
    },

    // Initialize new properties for loop loading state
    _isLoopLoading: false,
    _pendingLoopName: null,

    // Set song queue
    setSongQueue: (queue) => {
      const state = get();
      
      // Check if the queue is actually different before updating state
      const isQueueDifferent = state.songQueue.length !== queue.length || 
        state.songQueue.some((url, index) => url !== queue[index]);
      
      // Only update state if the queue has actually changed
      if (isQueueDifferent) {
        // Reset song index when setting a new queue
        set({ 
          songQueue: queue,
          currentSongIndex: 0
        });
      }
    },

    // Get the current song title
    getCurrentSongTitle: () => {
      const currentSong = get().currentSong;
      if (!currentSong) return 'No song playing';
      return getSongTitleFromUrl(currentSong);
    },

    // Handle theme change
    handleThemeChange: async (newTheme, wasPlaying = false) => {
      console.log('[AudioSlice] Theme changed to', newTheme, 'wasPlaying:', wasPlaying);
      const state = get();
      const currentlyPlaying = state.isPlaying;
      
      // Only restart music if it was playing or if override flag is set
      if (currentlyPlaying || wasPlaying) {
        // First stop any current music
        state.stopMusic();
        
        // Wait a moment for the previous track to clean up
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If we have a queue with songs, start playing the first one
        if (state.songQueue.length > 0) {
          console.log('[AudioSlice] Auto-playing first song from new theme');
          try {
            await state.playMusic(state.songQueue[0]);
          } catch (error) {
            console.error('[AudioSlice] Error playing music after theme change:', error);
          }
        } else {
          console.log('[AudioSlice] No songs in queue after theme change');
        }
      } else {
        console.log('[AudioSlice] Not currently playing, no auto-play after theme change');
      }
    },

    // Toggle play/pause with smart resume
    togglePlayPause: async () => {
      console.log('[AudioSlice] togglePlayPause called, checking current state');
      const state = get();

      if (state.isPlaying) {
        console.log('[AudioSlice] Currently playing, stopping music');
        set({ isPlaying: false });
        
        if (state.musicSource) {
          try {
            state.musicSource.stop();
            state.musicSource.disconnect();
            console.log('[AudioSlice] Music source stopped and disconnected');
          } catch (error) {
            console.error('[AudioSlice] Error stopping music source:', error);
          }
        }
      } else {
        // Check if we have a song queue
        if (state.songQueue.length === 0) {
          console.log('[AudioSlice] Cannot play - song queue is empty');
          return;
        }
        
        console.log('[AudioSlice] Starting playback from queue');
        // Get the current song from the queue
        const songToPlay = state.songQueue[state.currentSongIndex];
        console.log('[AudioSlice] Playing song at index', state.currentSongIndex, ':', songToPlay);
        
        try {
          await state.playMusic(songToPlay);
          console.log('[AudioSlice] Playback started successfully');
        } catch (error) {
          console.error('[AudioSlice] Error starting playback:', error);
        }
      }
    },

    // Initialize the audio context
    initializeAudioContext: async () => {
      const state = get();
      
      if (state.audioContext) {
        // If suspended, try to resume
        if (state.audioContext.state === 'suspended') {
          try {
            await state.audioContext.resume();
          } catch (error) {
            // Error handling preserved but without logging
          }
        }
        
        return;
      }
      
      try {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Create gain nodes using the default volume coefficients
        const masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = DEFAULT_VOLUMES.master;
        masterGainNode.connect(audioContext.destination);
        
        const musicGainNode = audioContext.createGain();
        musicGainNode.gain.value = DEFAULT_VOLUMES.music;
        musicGainNode.connect(masterGainNode);
        
        const sfxGainNode = audioContext.createGain();
        sfxGainNode.gain.value = DEFAULT_VOLUMES.sfx; // Full volume for SFX
        sfxGainNode.connect(masterGainNode);
        
        const loopGainNode = audioContext.createGain();
        loopGainNode.gain.value = DEFAULT_VOLUMES.loop; // Lower volume for background loops
        loopGainNode.connect(masterGainNode);
        
        // Create voice gain node
        const voiceGainNode = audioContext.createGain();
        voiceGainNode.gain.value = DEFAULT_VOLUMES.voice;
        voiceGainNode.connect(masterGainNode);
        
        // Update state with new audio context and gain nodes
        set({
          audioContext,
          masterGainNode,
          musicGainNode,
          sfxGainNode,
          loopGainNode,
          voiceGainNode
        });
      } catch (error) {
        // Error handling preserved but without logging
        throw error;
      }
    },

    // Set global volume without pausing playback
    setMasterVolume: (volume) => {
      set({ masterVolume: volume });
      const state = get();
      
      // Use proper gain node for volume control
      if (state.masterGainNode) {
        // Use exponential ramp for smoother volume changes
        const now = state.audioContext?.currentTime || 0;
        state.masterGainNode.gain.setValueAtTime(state.masterGainNode.gain.value, now);
        state.masterGainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.1);
      }
    },

    // Set volume (alias for setMasterVolume for musicplayer.tsx)
    setVolume: (volume) => {
      const state = get();
      set({ volume });
      
      // Use master gain node for global volume control
      if (state.masterGainNode && state.audioContext) {
        // Use exponential ramp for smoother volume changes
        const now = state.audioContext.currentTime;
        state.masterGainNode.gain.setValueAtTime(state.masterGainNode.gain.value, now);
        state.masterGainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.1);
      }
    },

    // Skip to next song in queue
    skipToNext: async () => {
      console.log('[AudioSlice] skipToNext called');
      const state = get();

      if (state.songQueue.length === 0) {
        console.log('[AudioSlice] Cannot skip - song queue is empty');
        return;
      }

      // Calculate next index with wrap-around
      const nextIndex = (state.currentSongIndex + 1) % state.songQueue.length;
      console.log('[AudioSlice] Advancing from index', state.currentSongIndex, 'to', nextIndex);
      
      // Update state with new index
      set({ currentSongIndex: nextIndex });
      
      // Only play the next song if we were already playing
      if (state.isPlaying) {
        console.log('[AudioSlice] Auto-playing next song:', state.songQueue[nextIndex]);
        try {
          await state.playMusic(state.songQueue[nextIndex]);
        } catch (error) {
          console.error('[AudioSlice] Error playing next song:', error);
        }
      } else {
        console.log('[AudioSlice] Not currently playing, just updating index');
      }
    },

    // Load audio buffer for efficient playback
    loadAudioBuffer: async (url) => {
      console.log(`[AudioSlice] Loading audio buffer for URL: ${url}`);
      const state = get();
      if (!state.audioContext) {
        console.log(`[AudioSlice] Audio context not initialized in loadAudioBuffer, initializing now...`);
        await get().initializeAudioContext();
      }
      
      if (state.bufferCache.has(url)) {
        console.log(`[AudioSlice] Using cached buffer for: ${url}`);
        const cachedBuffer = state.bufferCache.get(url);
        if (cachedBuffer) return cachedBuffer;
      }

      try {
        console.log(`[AudioSlice] Fetching audio from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`[AudioSlice] Failed to fetch audio: ${response.status} ${response.statusText} for URL: ${url}`);
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }
        
        console.log(`[AudioSlice] Audio fetch successful, processing array buffer...`);
        const arrayBuffer = await response.arrayBuffer();
        
        // Ensure audioContext exists
        const audioContext = state.audioContext;
        if (!audioContext) {
          console.error(`[AudioSlice] Audio context not initialized after fetch`);
          throw new Error('Audio context not initialized');
        }
        
        console.log(`[AudioSlice] Decoding audio data...`);
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log(`[AudioSlice] Audio data decoded successfully, caching buffer`);
        state.bufferCache.set(url, buffer);
        return buffer;
      } catch (error) {
        console.error(`[AudioSlice] Error in loadAudioBuffer for ${url}:`, error);
        throw error;
      }
    },

    // Play music from a theme playlist or specific URL
    playMusic: async (trackUrl) => {
      console.log('[AudioSlice] playMusic called with URL:', trackUrl);
      const state = get();
      
      // Check if audio context exists
      if (!state.audioContext) {
        console.log('[AudioSlice] No audio context, initializing first');
        try {
          await state.initializeAudioContext();
          console.log('[AudioSlice] Audio context initialized successfully');
        } catch (error) {
          console.error('[AudioSlice] Failed to initialize audio context:', error);
          return;
        }
      }
      
      // Resume audio context if it's suspended
      if (state.audioContext?.state === 'suspended') {
        console.log('[AudioSlice] Audio context suspended, resuming');
        try {
          await state.audioContext.resume();
          console.log('[AudioSlice] Audio context resumed successfully');
        } catch (error) {
          console.error('[AudioSlice] Failed to resume audio context:', error);
          return;
        }
      }
      
      // Stop any currently playing music
      if (state.musicSource) {
        console.log('[AudioSlice] Stopping current music before playing new track');
        try {
          state.musicSource.stop();
          state.musicSource.disconnect();
          console.log('[AudioSlice] Previous music source stopped');
        } catch (error) {
          console.error('[AudioSlice] Error stopping previous music source:', error);
        }
      }

      try {
        console.log('[AudioSlice] Loading audio buffer for track');
        // Load the audio buffer
        const buffer = await state.loadAudioBuffer(trackUrl);
        console.log('[AudioSlice] Audio buffer loaded successfully');
        
        // Ensure audioContext exists
        const audioContext = state.audioContext;
        if (!audioContext) {
          console.error('[AudioSlice] Audio context not initialized after buffer load');
          throw new Error('Audio context not initialized');
        }
        
        // Create a new source node
        console.log('[AudioSlice] Creating audio source node');
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Connect to music gain node instead of directly to destination
        if (state.musicGainNode) {
          console.log('[AudioSlice] Connecting to music gain node with volume:', state.musicGainNode.gain.value);
          source.connect(state.musicGainNode);
        } else {
          console.warn('[AudioSlice] No music gain node, connecting directly to destination');
          source.connect(audioContext.destination);
        }
        
        // Set up cleanup when playback ends
        source.onended = () => {
          console.log('[AudioSlice] Track ended naturally, advancing to next song');
          // Don't disconnect here to avoid interruption
          // Call skipToNext to advance the playlist
          // We need to check isPlaying to avoid advancing when manually stopped
          if (get().isPlaying) {
            get().skipToNext();
          }
        };
        
        // Start playback
        console.log('[AudioSlice] Starting playback');
        source.start();
        
        // Update state
        set({ 
          musicSource: source,
          isPlaying: true,
          currentMusic: trackUrl,
          currentSong: trackUrl
        });
        console.log('[AudioSlice] Playback started, state updated');
      } catch (error) {
        console.error('[AudioSlice] Error in playMusic:', error);
        // Update state to reflect error
        set({ isPlaying: false });
        throw error;
      }
    },

    // Stop music
    stopMusic: () => {
      const state = get();
      if (state.musicSource && state.audioContext) {
        try {
          // Create a local reference to the audio context after null check
          const audioCtx = state.audioContext;
          
          // Create a short fade-out to prevent clicking
          const now = audioCtx.currentTime;
          
          // If we have a music gain node, use it for the fade-out
          if (state.musicGainNode) {
            // Get current volume
            const currentVolume = state.musicGainNode.gain.value;
            
            // Store the original volume to restore it later
            const originalVolume = state.volume;
            
            // Schedule a very quick fade-out (30ms) but don't go all the way to zero
            // This prevents the gain node from getting stuck at a very low value
            state.musicGainNode.gain.setValueAtTime(currentVolume, now);
            state.musicGainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
            
            // Stop the source after the fade-out
            setTimeout(() => {
              try {
                if (state.musicSource) {
                  state.musicSource.stop();
                  state.musicSource.disconnect();
                  
                  // Immediately restore the gain node to the original volume
                  if (state.musicGainNode && state.audioContext) {
                    state.musicGainNode.gain.cancelScheduledValues(state.audioContext.currentTime);
                    state.musicGainNode.gain.setValueAtTime(originalVolume, state.audioContext.currentTime);
                  }
                }
              } catch (error) {
                // Handle the case where the source might have already been stopped
              }
            }, 40); // Slightly longer than the fade-out time
          } else {
            // If no gain node, just stop immediately
            state.musicSource.stop();
            state.musicSource.disconnect();
          }
        } catch (error) {
          // Error handling preserved but without logging
        }
      } else if (state.musicSource) {
        // If we have a music source but no audio context, just stop it directly
        try {
          state.musicSource.stop();
          state.musicSource.disconnect();
        } catch (error) {
          // Error handling preserved but without logging
        }
      }
      set({ isPlaying: false, currentMusic: null, musicSource: null });
      // Note: We keep currentSong to remember what was playing
    },

    // Play SFX
    playSound: async (sfxName) => {
      console.log(`[AudioSlice] Attempting to play sound effect: ${sfxName}`);
      const state = get();
      if (!state.audioContext) {
        console.log(`[AudioSlice] Audio context not initialized for sound: ${sfxName}, initializing now...`);
        await get().initializeAudioContext();
      }
      
      const sfxPath = state._SOUND_MAPPINGS[sfxName];
      if (!sfxPath) {
        console.error(`[AudioSlice] Sound effect not found in mappings: ${sfxName}`);
        return;
      }

      try {
        console.log(`[AudioSlice] Loading buffer for sound: ${sfxName}`);
        const buffer = await state.loadAudioBuffer(getAudioPath(sfxPath, 'sfx'));
        
        // Ensure audioContext exists
        const audioContext = state.audioContext;
        if (!audioContext) {
          console.error(`[AudioSlice] Audio context not initialized after buffer load for: ${sfxName}`);
          throw new Error('Audio context not initialized');
        }
        
        console.log(`[AudioSlice] Creating source node for sound: ${sfxName}`);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Connect to SFX gain node instead of directly to destination
        if (state.sfxGainNode) {
          console.log(`[AudioSlice] Connecting to SFX gain node (volume: ${state.sfxGainNode.gain.value})`);
          source.connect(state.sfxGainNode);
        } else {
          console.log(`[AudioSlice] No SFX gain node, connecting directly to destination`);
          source.connect(audioContext.destination);
        }
        
        // Set up cleanup when sound finishes
        source.onended = () => {
          console.log(`[AudioSlice] Sound effect finished playing: ${sfxName}`);
          source.disconnect();
        };
        
        console.log(`[AudioSlice] Starting sound playback: ${sfxName}`);
        source.start();
        return Promise.resolve();
      } catch (error) {
        console.error(`[AudioSlice] Error playing sound effect ${sfxName}:`, error);
        return Promise.reject(error);
      }
    },

    // Play a looping sound
    playLoop: async (loopName) => {
      console.log(`[AudioSlice] Attempting to play loop: ${loopName}`);
      const state = get();
      
      // Check if this exact loop is already playing to prevent duplicates
      if (state.currentLoop === loopName && state.loopSource) {
        console.log(`[AudioSlice] Loop ${loopName} is already playing, skipping duplicate playback`);
        return;
      }
      
      // Initialize audio context if needed
      if (!state.audioContext) {
        console.log(`[AudioSlice] Audio context not initialized, initializing now...`);
        try {
          await get().initializeAudioContext();
          console.log(`[AudioSlice] Audio context initialized successfully`);
        } catch (error) {
          console.error(`[AudioSlice] Failed to initialize audio context:`, error);
          return;
        }
      }

      // Always stop any existing loop before starting a new one
      state.stopLoop();
      
      try {
        const fullPath = getAudioPath(loopName, 'loop');
        console.log(`[AudioSlice] Loading audio buffer for: ${loopName}`);
        console.log(`[AudioSlice] Full path: ${fullPath}`);
        console.log(`[AudioSlice] Audio context state:`, state.audioContext?.state);
        
        const buffer = await state.loadAudioBuffer(fullPath);
        console.log(`[AudioSlice] Buffer loaded successfully:`, {
          duration: buffer.duration,
          numberOfChannels: buffer.numberOfChannels,
          sampleRate: buffer.sampleRate
        });
        
        // Ensure audioContext exists
        const audioContext = state.audioContext;
        if (!audioContext) {
          console.error(`[AudioSlice] Audio context still not initialized after attempt`);
          throw new Error('Audio context not initialized');
        }

        console.log(`[AudioSlice] Creating buffer source for loop`);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        // Connect to loop gain node instead of directly to destination
        if (state.loopGainNode) {
          console.log(`[AudioSlice] Connecting to loop gain node with gain value:`, state.loopGainNode.gain.value);
          source.connect(state.loopGainNode);
        } else {
          console.warn(`[AudioSlice] No loop gain node, connecting directly to destination`);
          source.connect(audioContext.destination);
        }
        
        console.log(`[AudioSlice] Starting loop playback`);
        source.start();

        set({ 
          currentLoop: loopName, 
          loopSource: source
        });
        console.log(`[AudioSlice] Loop playback started successfully`);
      } catch (error) {
        console.error(`[AudioSlice] Error playing loop ${loopName}:`, error);
      }
    },

    // Stop a looping sound
    stopLoop: () => {
      const state = get();
      if (state.loopSource) {
        try {
          state.loopSource.stop();
          // Disconnect to free resources
          state.loopSource.disconnect();
        } catch (error) {
          // Error handling preserved but without logging
        }
      }
      set({ 
        currentLoop: null, 
        loopSource: null,
        _isLoopLoading: false,
        _pendingLoopName: null
      });
    },

    // New method: Play voice audio from base64
    playVoice: async (audioBase64: string) => {
      console.log('[AudioSlice] playVoice called with base64 audio');
      const state = get();
      
      // Make sure the audio context is initialized
      if (!state.audioContext) {
        console.log('[AudioSlice] No audio context, initializing for voice');
        try {
          await state.initializeAudioContext();
        } catch (error) {
          console.error('[AudioSlice] Failed to initialize audio context for voice:', error);
          return;
        }
      }
      
      // Resume audio context if suspended
      if (state.audioContext?.state === 'suspended') {
        try {
          await state.audioContext.resume();
        } catch (error) {
          console.error('[AudioSlice] Failed to resume audio context for voice:', error);
          return;
        }
      }
      
      // Stop any previously playing voice
      state.stopVoice();
      
      try {
        // Convert base64 to blob
        const audioData = atob(audioBase64);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Load the audio buffer
        console.log('[AudioSlice] Loading voice audio buffer');
        const buffer = await state.loadAudioBuffer(audioUrl);
        
        // Create a source node
        const source = state.audioContext!.createBufferSource();
        source.buffer = buffer;
        
        // Connect to the voice gain node
        if (state.voiceGainNode) {
          source.connect(state.voiceGainNode);
        } else {
          source.connect(state.audioContext!.destination);
        }
        
        // Clean up when done playing
        source.onended = () => {
          console.log('[AudioSlice] Voice audio playback completed');
          // Revoke URL to free memory
          URL.revokeObjectURL(audioUrl);
          set({ voiceSource: null });
        };
        
        // Start playback
        source.start();
        set({ voiceSource: source });
        console.log('[AudioSlice] Voice playback started');
      } catch (error) {
        console.error('[AudioSlice] Error playing voice audio:', error);
      }
    },
    
    // Stop voice playback
    stopVoice: () => {
      const state = get();
      if (state.voiceSource && state.audioContext) {
        try {
          state.voiceSource.stop();
          state.voiceSource.disconnect();
        } catch (error) {
          // Handle the case where the source might have already stopped
        }
      }
      set({ voiceSource: null });
    }
  }))
);
