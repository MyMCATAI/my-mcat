"use client"
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
    initialMessages: [createChatBotMessage(`🐱 Meow! I'm Kalypso, your MCAT assistant. How can I help you today?`, { widget: "someWidget" })], // Add an options object if needed
  };

export default config;