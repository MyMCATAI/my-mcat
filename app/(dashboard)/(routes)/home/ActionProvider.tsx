"use client"
import React, { ReactNode } from 'react';

interface ActionProviderProps {
  createChatBotMessage: (message: string) => any; 
  setState: (state: any) => void; 
  children: ReactNode;
}

const ActionProvider: React.FC<ActionProviderProps> = ({ createChatBotMessage, setState, children }) => {
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          actions: {},
        });
      })}
    </div>
  );
};

export default ActionProvider;
