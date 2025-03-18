// Re-export all slice stores
export { useAudioStore } from './slices/audioSlice';
export { useUIStore } from './slices/uiSlice';
export { useGameStore } from './slices/gameSlice';
export { useUserStore } from './slices/userSlice';
export { useVocabStore } from './slices/vocabSlice';

// Re-export all types
export * from './types';
export type { ThemeType, WindowSize } from './slices/uiSlice';

// For backward compatibility with existing code
import { useAudioStore } from './slices/audioSlice';
import { useUIStore } from './slices/uiSlice';
import { useGameStore } from './slices/gameSlice';
import { useUserStore } from './slices/userSlice';
import { useVocabStore } from './slices/vocabSlice';

// Flag to track global initialization
let isStoreInitialized = false;

type StoreUpdates = Record<string, any>;

// Create a combined store for backward compatibility
// @ts-ignore - This is exported for backward compatibility but might not be used directly
export const useStore = {
  getState: () => ({
    ...useAudioStore.getState(),
    ...useUIStore.getState(),
    ...useGameStore.getState(),
    ...useUserStore.getState(),
    ...useVocabStore.getState(),
  }),
  
  setState: (updates: StoreUpdates) => {
    // Determine which slice each update belongs to and apply accordingly
    const audioKeys = new Set(Object.keys(useAudioStore.getState()));
    const uiKeys = new Set(Object.keys(useUIStore.getState()));
    const gameKeys = new Set(Object.keys(useGameStore.getState()));
    const userKeys = new Set(Object.keys(useUserStore.getState()));
    const vocabKeys = new Set(Object.keys(useVocabStore.getState()));
    
    // Extract updates for each slice
    const audioUpdates: StoreUpdates = {};
    const uiUpdates: StoreUpdates = {};
    const gameUpdates: StoreUpdates = {};
    const userUpdates: StoreUpdates = {};
    const vocabUpdates: StoreUpdates = {};
    
    // Sort updates into appropriate slices
    Object.entries(updates).forEach(([key, value]) => {
      if (audioKeys.has(key)) {
        audioUpdates[key] = value;
      } else if (uiKeys.has(key)) {
        uiUpdates[key] = value;
      } else if (gameKeys.has(key)) {
        gameUpdates[key] = value;
      } else if (userKeys.has(key)) {
        userUpdates[key] = value;
      } else if (vocabKeys.has(key)) {
        vocabUpdates[key] = value;
      }
    });
    
    // Apply updates to each slice
    if (Object.keys(audioUpdates).length > 0) {
      useAudioStore.setState(audioUpdates);
    }
    if (Object.keys(uiUpdates).length > 0) {
      useUIStore.setState(uiUpdates);
    }
    if (Object.keys(gameUpdates).length > 0) {
      useGameStore.setState(gameUpdates);
    }
    if (Object.keys(userUpdates).length > 0) {
      useUserStore.setState(userUpdates);
    }
    if (Object.keys(vocabUpdates).length > 0) {
      useVocabStore.setState(vocabUpdates);
    }
  },
  
  subscribe: (callback: (state: any, prevState: any) => void) => {
    // Subscribe to all slice stores
    const unsubAudio = useAudioStore.subscribe(callback);
    const unsubUI = useUIStore.subscribe(callback);
    const unsubGame = useGameStore.subscribe(callback);
    const unsubUser = useUserStore.subscribe(callback);
    const unsubVocab = useVocabStore.subscribe(callback);
    
    // Return a function to unsubscribe from all
    return () => {
      unsubAudio();
      unsubUI();
      unsubGame();
      unsubUser();
      unsubVocab();
    };
  }
};

// Export a function to initialize the store at the app level
export const initializeGlobalStore = async (options?: { forceOnboarding?: boolean }): Promise<void> => {
  if (typeof window !== 'undefined' && !isStoreInitialized) {
    console.debug('[Store] Initializing global store');
    try {
      // Initialize audio context
      await useAudioStore.getState().initializeAudioContext();
      
      // Initialize UI state
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
        useUIStore.getState().setTheme(savedTheme as any);
      }
      
      // Process debug options
      if (options?.forceOnboarding) {
        console.debug('[Store] DEBUG MODE: Forcing onboardingComplete to true for testing');
        useUserStore.getState().setOnboardingComplete(true);
      }
      
      isStoreInitialized = true;
      console.debug('[Store] Store initialization complete');
    } catch (error) {
      console.error('[Store] Store initialization failed:', error);
      throw error;
    }
  }
}; 