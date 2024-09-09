import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InlineChatbotProps {
  context: string;
  onShowExplanations: () => void;
  onMessageSent: (message: string) => void;
}

const LoadingDots = () => (
  <div className="flex space-x-1 mt-2">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
  </div>
);

const InlineChatbot: React.FC<InlineChatbotProps> = ({ context, onShowExplanations, onMessageSent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleSendMessage = async () => {
    let message = chatMessages.length < 1 ? context : userInput;
    if (!message.trim()) return;
    setIsLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');

    // Call onMessageSent with the user's message
    onMessageSent(`User: ${userInput}`);

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          threadId: threadId,
          assistantId: process.env.NEXT_PUBLIC_CARS_ASSISTANT_ID,
          generateAudio: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      const newAssistantMessage: ChatMessage = { role: 'assistant', content: data.message };
      setChatMessages(prevMessages => [...prevMessages, newAssistantMessage]);
      setThreadId(data.threadId);

      // Call onMessageSent with the assistant's message
      onMessageSent(`Kalypso: ${data.message}`);

      onShowExplanations();
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
      
      // Call onMessageSent with the error message
      onMessageSent(`Kalypso: Sorry, there was an error processing your request.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {(chatMessages.length > 0 || isLoading) && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <React.Fragment key={index}>
                {message.role === 'user' && (
                  <div className="flex justify-end">
                    <p className="inline-block p-2 rounded-lg bg-white max-w-[80%]">{message.content}</p>
                  </div>
                )}
                {message.role === 'assistant' && (
                  <div className="space-y-1">
                    <div className="flex justify-start">
                      <span className="text-sm text-gray-600 ml-2">Kalypso 🐱</span>
                    </div>
                    <div className="flex justify-start">
                      <p className="inline-block p-2 rounded-lg bg-blue-100 text-blue-800 max-w-[80%]">{message.content}</p>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            {isLoading && (
              <div className="space-y-1">
                <div className="flex justify-start">
                  <span className="text-sm text-gray-600 ml-2">Kalypso 🐱</span>
                </div>
                <div className="flex justify-start">
                  <div className="inline-block p-2 rounded-lg bg-blue-100 text-blue-800">
                    <LoadingDots />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-center m-2">
        <Textarea
          disabled={isLoading}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={chatMessages.length > 0 ? "Type your Message" : "Why did you choose your answer? Explain your line of thinking..."}
          className="flex-grow mr-2"
        />
        <div className="flex items-center justify-center">
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !userInput}
            className="self-start"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineChatbot;