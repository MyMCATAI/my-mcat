"use client"
import React, { ReactNode } from 'react';

interface MessageParserProps {
  children: ReactNode;
  actions: any;
}

const MessageParser: React.FC<MessageParserProps> = ({ children, actions }) => {
  const parse = async (message: string) => {
    if (message.trim() === '') return;

    try {
      const response = await fetch('/api/conversation', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      console.log(data)
      actions.handleApiResponse(data.message);
    } catch (error) {
      console.error('Error:', error);
      actions.handleError('Sorry, there was an error processing your request.');
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          parse: parse,
          actions: actions,
        });
      })}
    </div>
  );
};

export default MessageParser;