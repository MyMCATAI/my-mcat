/**
 * Preload utility for AnkiClinic components
 * This file contains functions to preload critical components and assets
 */

// Preload core components
export const preloadCoreComponents = async () => {
  try {
    console.log('[Preload] Starting to preload AnkiClinic core components');
    
    // Preload core components
    const coreImports = [
      import('./OfficeContainer'),
      import('./ResourcesMenu')
    ];
    
    await Promise.all(coreImports);
    console.log('[Preload] Core components preloaded successfully');
  } catch (error) {
    console.error('[Preload] Error preloading core components:', error);
  }
};

// Preload secondary components
export const preloadSecondaryComponents = async () => {
  try {
    console.log('[Preload] Starting to preload AnkiClinic secondary components');
    
    // Preload secondary components in sequence to avoid overwhelming the browser
    await import('./WelcomeDialog');
    await import('./ShoppingDialog');
    await import('./FlashcardsDialog');
    
    console.log('[Preload] Secondary components preloaded successfully');
  } catch (error) {
    console.error('[Preload] Error preloading secondary components:', error);
  }
};

// Preload audio assets
export const preloadAudioAssets = async () => {
  try {
    console.log('[Preload] Starting to preload audio assets');
    
    // Create audio elements to preload sounds
    const ambientSound = new Audio('/audio/flashcard-loop-catfootsteps.mp3');
    ambientSound.preload = 'auto';
    
    // Just requesting the audio file will start loading it
    const doorOpenSound = new Audio('/audio/flashcard-door-open.mp3');
    doorOpenSound.preload = 'auto';
    
    const doorCloseSound = new Audio('/audio/flashcard-door-closed.mp3');
    doorCloseSound.preload = 'auto';
    
    console.log('[Preload] Audio assets preload initiated');
  } catch (error) {
    console.error('[Preload] Error preloading audio assets:', error);
  }
};

// Main preload function that orchestrates all preloading
export const preloadAnkiClinic = async () => {
  console.log('[Preload] Starting AnkiClinic preload sequence');
  
  // Start preloading core components immediately
  const corePromise = preloadCoreComponents();
  
  // Start preloading audio assets immediately
  const audioPromise = preloadAudioAssets();
  
  // Wait for core components to load before loading secondary components
  await corePromise;
  
  // Start preloading secondary components
  const secondaryPromise = preloadSecondaryComponents();
  
  // Wait for all preloading to complete
  await Promise.all([audioPromise, secondaryPromise]);
  
  console.log('[Preload] AnkiClinic preload sequence completed');
};

export default preloadAnkiClinic; 