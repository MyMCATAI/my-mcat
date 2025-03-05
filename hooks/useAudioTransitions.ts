import { useRef, useEffect, useCallback } from 'react';
import { useAudio } from "@/contexts/AudioContext";

interface UseAudioTransitionsProps {
  isFlashcardsOpen: boolean;
  isLoading: boolean;
  isMounted?: boolean;
}

/**
 * Custom hook to manage audio transitions between different states
 * Handles playing door sounds and looping ambient sounds
 */
export const useAudioTransitions = ({ 
  isFlashcardsOpen, 
  isLoading,
  isMounted = true
}: UseAudioTransitionsProps) => {
  const audio = useAudio();
  
  // Refs to track state
  const audioTransitionInProgressRef = useRef<boolean>(false);
  const prevIsFlashcardsOpenRef = useRef<boolean | null>(null);
  const prevFlashcardsOpenRef = useRef<boolean>(false);
  
  // Effect to handle audio transitions when flashcard dialog opens/closes
  useEffect(() => {
    // Skip if the value hasn't actually changed
    if (prevIsFlashcardsOpenRef.current === isFlashcardsOpen) {
      return;
    }
    
    // Update the ref
    prevIsFlashcardsOpenRef.current = isFlashcardsOpen;
    
    if (!isMounted) {
      return;
    }
    
    let isEffectActive = true; // Local flag to track if effect is still active
    
    // Add a small delay to allow any loading state changes to settle
    const timeoutId = setTimeout(() => {
      // Skip audio transitions during initial load
      if (isLoading) {
        return;
      }
      
      // Prevent multiple audio transitions
      if (audioTransitionInProgressRef.current) {
        return;
      }
      
      audioTransitionInProgressRef.current = true;
  
      const handleAudioTransition = async () => {
        try {
          if (!isEffectActive) return;

          if (isFlashcardsOpen) {
            audio.stopAllLoops();
            if (!isEffectActive) return;
            audio.playSound('flashcard-door-open');
          } else {
            if (prevFlashcardsOpenRef.current) {
              audio.playSound('flashcard-door-closed');
              await new Promise(resolve => setTimeout(resolve, 500));
              if (!isEffectActive) return;
              audio.loopSound('flashcard-loop-catfootsteps');
            } else {
              audio.loopSound('flashcard-loop-catfootsteps');
            }
          }
          if (!isEffectActive) return;
          prevFlashcardsOpenRef.current = isFlashcardsOpen;
        } catch (error) {
          if (isEffectActive) {
            console.error('[AudioTransitions] Audio transition error:', error);
          }
        } finally {
          if (isEffectActive) {
            audioTransitionInProgressRef.current = false;
          }
        }
      };

      handleAudioTransition();
    }, 50); // Small delay to allow loading state to settle

    return () => {
      clearTimeout(timeoutId);
      isEffectActive = false;
    };
  }, [isFlashcardsOpen, audio, isLoading, isMounted]);

  // Function to initialize ambient sound on component mount
  const initializeAmbientSound = useCallback((soundName = 'flashcard-loop-catfootsteps') => {
    if (!audio || audioTransitionInProgressRef.current) return;
    
    const initAmbientSound = async () => {
      try {
        audioTransitionInProgressRef.current = true;
        audio.loopSound(soundName);
      } catch (error) {
        console.error('[AudioTransitions] Error initializing ambient sound:', error);
      } finally {
        audioTransitionInProgressRef.current = false;
      }
    };
    
    // Only start ambient sound if flashcards are not open
    if (!isFlashcardsOpen) {
      initAmbientSound();
    }
  }, [audio, isFlashcardsOpen]);

  // Function to stop all audio
  const stopAllAudio = useCallback(() => {
    if (!audio) return;
    
    try {
      audio.stopAllLoops();
    } catch (error) {
      console.error('[AudioTransitions] Error stopping audio:', error);
    }
  }, [audio]);

  return {
    initializeAmbientSound,
    stopAllAudio,
    isAudioTransitionInProgress: () => audioTransitionInProgressRef.current
  };
};

export default useAudioTransitions; 