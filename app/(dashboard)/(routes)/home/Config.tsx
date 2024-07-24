"use client"
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
    initialMessages: [createChatBotMessage(`Hello world`, { widget: "someWidget" })], // Add an options object if needed
  };

export default config;