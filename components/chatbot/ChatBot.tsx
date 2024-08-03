"use client"
import React, { useState } from 'react';
import ChatBot from "react-chatbotify";

const MyChatBot = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (message: string) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Sending message:', message);
            const response = await fetch('/api/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received response:', data);
            return data.message;
        } catch (error) {
            console.error('Error:', error);
            setError(`An error occurred while sending the message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const flow = {
        start: {
            message: "Hi! I'm Kalypso the cat, your MCAT assistant. How can I help you today?",
            path: "loop"
        },
        loop: {
            message: async (params: { userInput: string }) => {
                const response = await sendMessage(params.userInput);
                if (response) {
                    return response;
                } else {
                    return "I'm sorry, I couldn't process your request. Please try again.";
                }
            },
            path: "loop"
        }
    };

    const settings = {
        general: {
            embedded: true
        },
        chatHistory: {
            storageKey: "mcat_assistant_chat_history"
        },
        header: {
            title: (
                <div style={{cursor: "pointer", margin: 0, fontSize: 20, fontWeight: "bold"}} onClick={
                    () => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                }>
                    kalypso
                </div>
            )
        },
        voice: {
          disabled: false,
          defaultToggledOn: true,
          language: "en-US",
          autoSendDisabled: false,
          autoSendPeriod: 1000,
          sendAsAudio: false,
        },
        botBubble: {
            simStream: true
        }
    };

    const themes = [
        {id: "simple_blue", version: "0.1.0"},
    ];

    return (
        <div>
            <ChatBot 
                settings={settings}
                themes={themes}
                flow={flow}
            />
            {isLoading && <p>Loading...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
};

const App = () => {
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <MyChatBot />
        </div>
    );
};

export default App;
