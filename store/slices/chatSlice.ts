import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ChatState {
  currentPrompt: string | null;
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

interface ChatActions {
  setCurrentPrompt: (prompt: string | null) => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChat: () => void;
}

type ChatSlice = ChatState & ChatActions;

export const useChatStore = create<ChatSlice>()(
  devtools(
    (set) => ({
      // Initial state
      currentPrompt: null,
      chatHistory: [],

      // Actions
      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, { ...message, timestamp: Date.now() }]
      })),
      clearChat: () => set({ chatHistory: [] })
    }),
    {
      name: 'chat-store'
    }
  )
); 