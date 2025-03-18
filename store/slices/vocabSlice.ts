import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

//========================= Types ===============================
interface VocabWord {
  word: string;
  definitions: string;
}

interface VocabState {
  // Vocab state
  vocabList: VocabWord[];
  showVocabList: boolean;
  isCmdIEnabled: boolean;
}

interface VocabActions {
  // Vocab actions
  addVocabWord: (word: string, definition: string) => void;
  removeVocabWord: (word: string) => void;
  toggleVocabList: () => void;
  toggleCmdI: () => void;
}

//========================= Store Creation ===============================
export const useVocabStore = create<VocabState & VocabActions>()(
  devtools((set, get) => ({
    // Vocab state
    vocabList: [],
    showVocabList: false,
    isCmdIEnabled: true,
    
    // Vocab actions
    addVocabWord: (word, definition) => {
      set((state) => ({
        vocabList: [
          ...state.vocabList,
          { word, definitions: definition }
        ]
      }));
    },
    
    removeVocabWord: (word) => {
      set((state) => ({
        vocabList: state.vocabList.filter((item) => item.word !== word)
      }));
    },
    
    toggleVocabList: () => {
      set((state) => ({
        showVocabList: !state.showVocabList
      }));
    },
    
    toggleCmdI: () => {
      set((state) => ({
        isCmdIEnabled: !state.isCmdIEnabled
      }));
    },
  }))
);