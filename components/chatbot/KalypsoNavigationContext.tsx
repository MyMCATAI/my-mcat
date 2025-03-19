"use client";

import React, { useEffect, useRef } from 'react';
import { useUI } from '@/store/selectors';
import ChatBot from './ChatBot';

interface KalypsoNavigationContextProps {
  chatbotContext?: {
    contentTitle: string;
    context: string;
  } | null;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  avatar?: string;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
}

/**
 * A wrapper component for ChatBot that injects navigation context
 * This ensures Kalypso always has current navigation information
 */
const KalypsoNavigationContext: React.FC<KalypsoNavigationContextProps> = ({ 
  chatbotContext,
  width,
  height,
  backgroundColor,
  avatar,
  chatbotRef,
}) => {
  const { navigation } = useUI();
  
  // Create an enhanced context that includes navigation data
  const enhancedContext = {
    contentTitle: chatbotContext?.contentTitle || 'Navigation Context',
    context: buildContextString(chatbotContext?.context, navigation)
  };
  
  // Log navigation context updates for debugging
  useEffect(() => {
    console.debug('Navigation context updated:', navigation);
  }, [navigation]);
  
  return (
    <ChatBot
      chatbotContext={enhancedContext}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      avatar={avatar}
      chatbotRef={chatbotRef}
    />
  );
};

/**
 * Maps path to a friendly section name for Kalypso
 */
function getReadableSectionName(path: string): string {
  const pathMap: Record<string, string> = {
    '/home': 'Home Dashboard',
    '/kalypsoai': 'Kalypso AI',
    '/practice-tests': 'Practice Tests',
    '/tutoring-suite': 'Tutoring Suite',
    '/cars-suite': 'CARS Suite',
    '/ankiclinic': 'Anki Clinic',
    '/test': 'Test',
    '/user-test': 'Test Review',
    '/settings': 'Settings',
    '/pricing': 'Pricing',
    '/blog': 'Blog',
    '/onboarding': 'Onboarding'
  };
  
  return pathMap[path] || path;
}

/**
 * Builds a context string that includes navigation information
 */
function buildContextString(existingContext: string | undefined, navigation: any): string {
  const sectionName = getReadableSectionName(navigation.page);
  
  const navigationContext = `
User Navigation Context:
- Current Section: ${sectionName}
- URL Path: ${navigation.page}
${
  Object.keys(navigation.subSection).length > 0 
    ? `- Context Details: ${JSON.stringify(navigation.subSection, null, 2)}`
    : '- No additional context available'
}
`;

  // If there's existing context, combine it with navigation context
  if (existingContext) {
    return `${existingContext}\n\n${navigationContext}`;
  }
  
  return navigationContext;
}

export default KalypsoNavigationContext; 