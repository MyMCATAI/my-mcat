import { useCallback, useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onHighlight: () => void;
  onStrikethrough: () => void;
  onToggleChatbot: () => void;
  isCmdIEnabled: boolean;
  onWordSelect?: (word: string, rect: DOMRect) => void;
}

export const useKeyboardShortcuts = ({
  onHighlight,
  onStrikethrough,
  onToggleChatbot,
  isCmdIEnabled,
  onWordSelect,
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for either Cmd (Meta) or Ctrl key
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'i':
            if (isCmdIEnabled && onWordSelect) {
              const selection = window.getSelection();
              if (selection && selection.toString().trim() !== '') {
                const word = selection.toString().trim();
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                onWordSelect(word, rect);
              }
            }
            break;
          
          case 'a':
            event.preventDefault();
            onToggleChatbot();
            break;
          
          case 's':
            event.preventDefault();
            onStrikethrough();
            break;
          
          case 'h':
            event.preventDefault();
            onHighlight();
            break;
        }
      }
    },
    [isCmdIEnabled, onWordSelect, onToggleChatbot, onStrikethrough, onHighlight]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
