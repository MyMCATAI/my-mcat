import React, { useState, useCallback } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CustomChatbotProps {
  assistantId: string;
  threadId?: string;
}

const CustomChatbot: React.FC<CustomChatbotProps> = ({ assistantId, threadId: initialThreadId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string | undefined>(initialThreadId);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          threadId,
          generateAudio: false,
          assistantId
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');

      const data: { message: string; threadId: string } = await res.json();
      setResponse(data.message);
      setThreadId(data.threadId);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsLoading(false);
    }
  }, [input, threadId, assistantId]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full border border-gray-200 rounded-lg">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold">
        Ask the AI Assistant
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4">
        <div className="flex flex-col space-y-4">
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-2 border rounded"
          />
          <Button onClick={handleSubmit} disabled={isLoading} className="self-end">
            {isLoading ? 'Sending...' : <Send className="h-4 w-4" />}
          </Button>
          {response && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">Assistant&apos;s Response:</h4>
              <p>{response}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CustomChatbot;