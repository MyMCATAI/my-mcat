// Re-export all slice stores
export { useAudioStore } from './slices/audioSlice';
export { useUIStore } from './slices/uiSlice';
export { useGameStore } from './slices/gameSlice';
export { useChatStore } from './slices/chatSlice';

// Re-export all types
export * from './types';
export type { ThemeType, WindowSize } from './slices/uiSlice';

// For backward compatibility with existing code
import { useAudioStore } from './slices/audioSlice';
import { useUIStore } from './slices/uiSlice';
import { useGameStore } from './slices/gameSlice';
import { useChatStore } from './slices/chatSlice';
import { create } from 'zustand';

// Flag to track global initialization
let isStoreInitialized = false;

// Create a combined store for backward compatibility
// This will be expanded as we migrate more slices
export const useStore = {
  getState: () => ({
    ...useAudioStore.getState(),
    ...useUIStore.getState(),
    ...useGameStore.getState(),
    ...useChatStore.getState(),
  }),
  setState: (updates: any) => {
    // Determine which slice each update belongs to and apply accordingly
    const audioKeys = new Set(Object.keys(useAudioStore.getState()));
    const uiKeys = new Set(Object.keys(useUIStore.getState()));
    const gameKeys = new Set(Object.keys(useGameStore.getState()));
    const chatKeys = new Set(Object.keys(useChatStore.getState()));
    
    // Extract updates for each slice
    const audioUpdates: Record<string, any> = {};
    const uiUpdates: Record<string, any> = {};
    const gameUpdates: Record<string, any> = {};
    const chatUpdates: Record<string, any> = {};
    
    // Sort updates into appropriate slices
    Object.entries(updates).forEach(([key, value]) => {
      if (audioKeys.has(key)) {
        audioUpdates[key] = value;
      } else if (uiKeys.has(key)) {
        uiUpdates[key] = value;
      } else if (gameKeys.has(key)) {
        gameUpdates[key] = value;
      } else if (chatKeys.has(key)) {
        chatUpdates[key] = value;
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
    if (Object.keys(chatUpdates).length > 0) {
      useChatStore.setState(chatUpdates);
    }
  },
  subscribe: (callback: (state: any, prevState: any) => void) => {
    // Subscribe to all slice stores
    const unsubAudio = useAudioStore.subscribe(callback);
    const unsubUI = useUIStore.subscribe(callback);
    const unsubGame = useGameStore.subscribe(callback);
    const unsubChat = useChatStore.subscribe(callback);
    
    // Return a function to unsubscribe from all
    return () => {
      unsubAudio();
      unsubUI();
      unsubGame();
      unsubChat();
    };
  }
};

// Export a function to initialize the store at the app level
export const initializeGlobalStore = async () => {
  if (typeof window !== 'undefined' && !isStoreInitialized) {
    console.debug('[DEBUG][Store] Initializing global store from exported function');
    try {
      await useAudioStore.getState().initializeAudioContext();
      
      // Initialize UI state
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
        useUIStore.getState().setTheme(savedTheme as any);
      }
      
      isStoreInitialized = true;
      console.debug('[DEBUG][Store] Store initialization complete');
    } catch (error) {
      console.error('[DEBUG][Store] Store initialization failed:', error);
    }
  }
}; 