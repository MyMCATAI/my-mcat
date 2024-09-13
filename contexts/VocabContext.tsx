import React, { createContext, useState, ReactNode } from 'react';

// Define the structure of a vocabulary word
interface VocabWord {
  word: string;
  definitions: string; // This will now hold all definitions as a single string
}

// Update the context properties
interface VocabContextProps {
  vocabList: VocabWord[];
  addVocabWord: (word: string, definition: string) => void;
  removeVocabWord: (word: string) => void;
  showVocabList: boolean;
  toggleVocabList: () => void;
  isCmdIEnabled: boolean; // New state for Command-I
  toggleCmdI: () => void;  // Function to toggle Command-I
  audioEnabled: boolean; // New property
  toggleAudio: () => void; // New function
}

// Initialize the context with default values
export const VocabContext = createContext<VocabContextProps>({
  vocabList: [],
  addVocabWord: () => {},
  removeVocabWord: () => {},
  showVocabList: false,
  toggleVocabList: () => {},
  isCmdIEnabled: true, // Default to enabled
  toggleCmdI: () => {},
  audioEnabled: false, // Default to false
  toggleAudio: () => {},
});

// Define the provider component
interface VocabProviderProps {
  children: ReactNode;
}

export const VocabProvider: React.FC<VocabProviderProps> = ({ children }) => {
  const [vocabList, setVocabList] = useState<VocabWord[]>([]);
  const [showVocabList, setShowVocabList] = useState(false);
  const [isCmdIEnabled, setIsCmdIEnabled] = useState(true); // New state
  const [audioEnabled, setAudioEnabled] = useState(false); // New state

  // Function to add a word to the vocab list
  const addVocabWord = (word: string, definitions: string) => {
    setVocabList(prev => {
      // Check if the word already exists
      const existingWordIndex = prev.findIndex(v => v.word.toLowerCase() === word.toLowerCase());
      
      if (existingWordIndex !== -1) {
        // If the word exists, update its definitions
        const updatedList = [...prev];
        updatedList[existingWordIndex] = { ...updatedList[existingWordIndex], definitions };
        return updatedList;
      } else {
        // If it's a new word, add it to the list
        return [...prev, { word, definitions }];
      }
    });
  };

  // Function to remove a word from the vocab list
  const removeVocabWord = (word: string) => {
    setVocabList(prev => prev.filter(v => v.word.toLowerCase() !== word.toLowerCase()));
  };

  // Function to toggle the visibility of the vocab list
  const toggleVocabList = () => {
    setShowVocabList(prev => !prev);
  };

  // New function to toggle Command-I
  const toggleCmdI = () => {
    setIsCmdIEnabled(prev => {
      const newValue = !prev;
      console.log(`Command-I toggled to: ${newValue}`);
      return newValue;
    });
  };

  // New function to toggle audio
  const toggleAudio = () => {
    setAudioEnabled(prev => {
      const newValue = !prev;
      console.log(`Audio toggled to: ${newValue}`);
      return newValue;
    });
  };

  return (
    <VocabContext.Provider value={{ 
      vocabList, 
      addVocabWord, 
      removeVocabWord, 
      showVocabList, 
      toggleVocabList,
      isCmdIEnabled,
      toggleCmdI,
      audioEnabled,
      toggleAudio
    }}>
      {children}
    </VocabContext.Provider>
  );
};