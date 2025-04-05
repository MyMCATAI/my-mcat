/**
 * Creates a debounced audio toggle function that prevents rapidly toggling audio
 */
export const createDebouncedAudioToggle = (
  toggleFunction: (newState: boolean) => void, 
  currentState: boolean,
  debounceTime: number = 500
) => {
  let lastToggleTime = 0;
  
  return () => {
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime;
    
    // Only allow toggle if it's been at least the specified debounce time since the last toggle
    if (timeSinceLastToggle < debounceTime) {
      return;
    }
    
    lastToggleTime = now;
    toggleFunction(!currentState);
  };
};

/**
 * Creates utility functions for playing, stopping, and managing voice audio
 */
export const createVoiceAudioHandlers = (
  audioInterface: { 
    playVoice: (audio: string) => void, 
    stopVoice: () => void,
    playSound: (soundName: string) => void
  }
) => {
  // Handler for playing voice audio from base64 string
  const playVoiceAudio = (audioBase64: string, shouldPlaySound: boolean = false) => {
    // Play the notification sound if requested
    if (shouldPlaySound) {
      audioInterface.playSound('chatbot-open');
    }
    
    // Play the actual voice content
    audioInterface.playVoice(audioBase64);
    
    // Return true to indicate successful playback
    return true;
  };
  
  // Handler for stopping current voice playback
  const stopVoiceAudio = () => {
    audioInterface.stopVoice();
    return true;
  };
  
  // Handler for toggling audio with sound effect
  const toggleVoiceAudio = (
    isAudioEnabled: boolean, 
    setAudioEnabled: (newState: boolean) => void
  ) => {
    // Play sound effect when turning on
    if (!isAudioEnabled) {
      audioInterface.playSound('chatbot-open');
    }
    
    // Toggle the state
    setAudioEnabled(!isAudioEnabled);
  };

  return {
    playVoiceAudio,
    stopVoiceAudio,
    toggleVoiceAudio
  };
}; 