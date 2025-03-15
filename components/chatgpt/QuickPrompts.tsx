import { useChatStore } from '@/store/slices/chatSlice';

/* --- Constants ----- */
const QUICK_PROMPTS = [
  { id: "schedule", text: "What's my schedule?", prompt: "What's on my schedule today?" },
  { id: "knowledge", text: "Show my progress", prompt: "Show me my current progress" },
  { id: "next-exam", text: "Next exam?", prompt: "When is my next practice exam?" }
];

const QuickPrompts = () => {
  const { setCurrentPrompt } = useChatStore();

  return (
    <div className="flex justify-center gap-4 p-4 border-t border-[--theme-border-color]">
      {QUICK_PROMPTS.map((action) => (
        <button
          key={action.id}
          onClick={() => setCurrentPrompt(action.prompt)}
          className="px-4 py-2 rounded-full bg-[--theme-doctorsoffice-accent] text-white text-sm hover:opacity-90 transition-opacity"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
};

export default QuickPrompts; 