/**
 * Sets up a command key handler that can toggle audio when the Command/Control key 
 * is pressed and released on its own (not as part of a keyboard shortcut)
 */
export const setupCommandKeyToggleHandler = (
  toggleCallback: () => void,
  options?: { 
    maxPressDuration?: number,
    debounceTime?: number 
  }
) => {
  const cmdPressedRef = { current: false };
  const cmdPressedTime = { current: null as number | null };
  let cmdReleaseTimer: NodeJS.Timeout | null = null;
  
  // Default options
  const maxPressDuration = options?.maxPressDuration || 500; // ms
  const debounceTime = options?.debounceTime || 50; // ms
  
  // Handler for key down events
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.key === 'Meta' || event.key === 'Control') && !event.repeat) {
      // Only set command pressed if no other keys are already pressed
      if (!cmdPressedRef.current) {
        cmdPressedRef.current = true;
        cmdPressedTime.current = Date.now();
      }
    } else if (cmdPressedRef.current) {
      // If any other key is pressed while Command is down, mark it as a combo
      // This prevents toggling audio when Command is used for shortcuts
      cmdPressedTime.current = null;
    }
  };

  // Handler for key up events
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Meta' || event.key === 'Control') {
      // Only toggle if it was a standalone Command press (not part of a combo)
      if (cmdPressedRef.current && cmdPressedTime.current) {
        const pressDuration = Date.now() - cmdPressedTime.current;
        if (pressDuration < maxPressDuration) { // Only toggle if pressed for less than maxPressDuration ms
          // Clear any existing timer to prevent multiple toggles
          if (cmdReleaseTimer) {
            clearTimeout(cmdReleaseTimer);
          }
          
          cmdReleaseTimer = setTimeout(() => {
            toggleCallback();
            cmdReleaseTimer = null;
          }, debounceTime); // Small delay to ensure no other keys were pressed
        }
      }
      cmdPressedRef.current = false;
      cmdPressedTime.current = null;
    }
  };

  // Setup and teardown functions
  const setupListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (cmdReleaseTimer) {
        clearTimeout(cmdReleaseTimer);
      }
    };
  };
  
  return { setupListeners };
};

/**
 * Sets up a keyboard shortcut handler for a textarea to send messages on Enter
 */
export const setupTextareaEnterHandler = (
  textareaSelector: string,
  sendCallback: (message: string, context?: string) => void
) => {
  const simulateEnterKeyPress = (message: string, context?: string) => {
    const textarea = document.querySelector(textareaSelector);
    if (textarea instanceof HTMLTextAreaElement) {
      // Set value and trigger input event
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Create and dispatch Enter keydown event
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        // Add the context as custom data
        ...(context && { __context: context })
      });
      
      // Focus the textarea and dispatch the event
      textarea.focus();
      setTimeout(() => {
        textarea.dispatchEvent(enterEvent);
      }, 100);
    }
  };
  
  return { simulateEnterKeyPress };
}; 