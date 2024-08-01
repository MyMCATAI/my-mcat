"use client"
import React, { ReactNode } from 'react';

interface ActionProviderProps {
  createChatBotMessage: (message: string) => any;
  setState: (state: any) => void;
  children: ReactNode;
}

const ActionProvider: React.FC<ActionProviderProps> = ({ createChatBotMessage, setState, children }) => {
  const handleApiResponse = (message: string) => {
    const botMessage = createChatBotMessage(message);
    
    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleError = (errorMessage: string) => {
    const botMessage = createChatBotMessage(errorMessage);

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };


  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          actions: {
            handleApiResponse,
            handleError,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;