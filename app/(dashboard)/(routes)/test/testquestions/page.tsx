"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TestComponent from "@/components/test-component";
import ChatBot from "@/components/chatbot/ChatBot";
import ChatbotWidget from "@/components/chatbot/ChatBotWidget";
import { Test } from "@/types";

const TestQuestions = () => {
  const searchParams = useSearchParams();
  const [test, setTest] = useState<Test | null>(null);

  const [loading, setLoading] = useState(true);

  const testId = searchParams.get('id');
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });

  useEffect(() => {
    fetchTest();
  }, [testId]);
  

 const fetchTest = async () => {
    if (!testId) {
      setError("No test ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/test?id=${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test');
      }
      const data: Test = await response.json();
      setTest(data);
      setChatbotContext({contentTitle:data.title,context:data.questions[0].question.passage?.text || ""})
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!testId) {
    return <div className="text-white">No test ID provided</div>;
  }

  return (
    <div className="relative">
      <TestComponent testId={testId} />
      
     {/* Chatbot */}
     <ChatbotWidget chatbotContext={chatbotContext} />

    </div>
  );
};

export default TestQuestions;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

