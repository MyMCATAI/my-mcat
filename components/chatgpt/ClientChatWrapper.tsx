"use client"

import { useRef } from "react";
import ChatLayout from "./ChatLayout";

interface ClientChatWrapperProps {
  isSubscribed?: boolean;
}

const ClientChatWrapper = ({ isSubscribed = true }: ClientChatWrapperProps) => {
  const chatbotRef = useRef<{ sendMessage: (message: string, messageContext?: string) => void }>({
    sendMessage: () => {}
  });
  
  return <ChatLayout isSubscribed={isSubscribed} chatbotRef={chatbotRef} />;
};

export default ClientChatWrapper; 