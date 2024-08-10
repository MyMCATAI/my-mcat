"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import TestComponent from "@/components/test-component";
import ChatBot from "@/components/chatbot/ChatBot";

const TestQuestions = () => {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const [showChatbot, setShowChatbot] = useState(false);

  if (!testId) {
    return <div className="text-white">No test ID provided</div>;
  }

  return (
    <div className="relative">
      <TestComponent testId={testId} />
      
      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end">
        {showChatbot && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4" style={{ width: '350px', height: '500px' }}>
            <ChatBot />
          </div>
        )}
        <button
          className="w-20 h-20 rounded-full overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
          onClick={() => setShowChatbot((prev) => !prev)}
          aria-label={showChatbot ? 'Close Chat' : 'Open Chat'}
        >
          <Image
            src="/Kalypso.png"
            alt="Chat with Kalypso"
            width={80}
            height={80}
            className="object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default TestQuestions;