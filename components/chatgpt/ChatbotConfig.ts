const React = require('react');
import type { Styles, Settings, Flow } from "react-chatbotify";
import { getThemeBubbleStyles, getMessageBubbleStyles, getChatInputContainerStyle } from "./ThemeUtils";

interface QuickAction {
  id: string;
  text: string;
  prompt: string;
}

/**
 * Generates the chatbot conversation flow with message handling
 */
export const generateChatbotFlow = (
  handleSendMessage: (message: string, messageContext?: string) => Promise<string>,
  initialMessage: string | (() => string | Promise<string>) 
): Flow => {
  return {
    start: {
      message: async () => {
        if (typeof initialMessage === 'function') {
          return await initialMessage();
        }
        return initialMessage;
      },
      path: "loop",
    },
    loop: {
      message: async (params: { userInput: string, messageContext?: string }) => {
        const response = await handleSendMessage(params.userInput, params.messageContext);
        return response;
      },
      path: "loop",
    },
  };
};

/**
 * Generates the chatbot settings configuration based on current state
 */
export const generateChatbotSettings = (
  audioEnabled: boolean,
  currentTheme: string,
  activeTab: string | null,
  quickActions: QuickAction[],
  handleTabClick: (tabId: string) => void,
  toggleAudio: () => void
): Settings => {
  return {
    general: {
      embedded: true,
      showHeader: true,
      showFooter: false,
    },
    event: {
      rcbUserSubmitText: true,
      rcbPreInjectMessage: true,
      rcbPostInjectMessage: true,
    },
    chatWindow: {
      autoJumpToBottom: true,
    },
    chatInput: {
      enabledPlaceholderText: "Chat with Kalypso",
      blockSpam: true,
    },
    chatHistory: { 
      storageKey: "mcat_assistant_chat_history", 
      disabled: true,
    },
    header: {
      showAvatar: false,
      title: React.createElement(
        'div',
        { className: "flex items-center justify-between w-full" },
        React.createElement(
          'div',
          { className: "flex text-[--theme-text-color] items-center gap-3" },
          [
            React.createElement(
              'div',
              { className: "flex items-center", key: "audio-toggle" },
              [
                React.createElement(
                  'button',
                  { 
                    onClick: toggleAudio,
                    className: "px-2 py-1 text-xs rounded-full transition-colors",
                    style: { 
                      color: audioEnabled ? "var(--theme-hover-color)" : "var(--theme-text-color)"
                    },
                    key: "audio-button"
                  },
                  audioEnabled ? "🔊" : "🔇"
                ),
                React.createElement(
                  'span',
                  { 
                    className: "text-[9px] ml-1 text-[--theme-text-color]",
                    key: "audio-label"
                  },
                  audioEnabled ? "speak with the mic" : "toggle voice with 'cmd' key"
                )
              ]
            ),
            ...quickActions.map((action) => 
              React.createElement(
                'button',
                { 
                  key: action.id,
                  className: "px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 border border-[--theme-border-color]",
                  style: { 
                    backgroundColor: activeTab === action.id 
                      ? "var(--theme-hover-color)" 
                      : "rgba(255,255,255,0.1)",
                    color: activeTab === action.id 
                      ? "var(--theme-hover-text)" 
                      : "var(--theme-text-color)"
                  },
                  onClick: () => handleTabClick(action.id)
                },
                action.text
              )
            )
          ]
        )
      )
    },
    notification: {
      disabled: true,
    },
    voice: {
      disabled: !audioEnabled,
      defaultToggledOn: true,
      language: "en-US",
      autoSendDisabled: false,
      autoSendPeriod: 3000,
      sendAsAudio: false,
      timeoutPeriod: 50000,
    },
    botBubble: {
      simStream: true,
      streamSpeed: audioEnabled ? 80 : 25,
      dangerouslySetInnerHtml: true,
    },
  };
};

/**
 * Generates the chatbot styles based on current theme
 */
export const generateChatbotStyles = (currentTheme: string): Styles => {
  const themeStyles = getThemeBubbleStyles(currentTheme);
  const messageBubbleStyles = getMessageBubbleStyles(currentTheme);
  const chatInputContainerStyle = getChatInputContainerStyle(currentTheme);
  
  const userBubbleStyle = {
    ...messageBubbleStyles.userBubbleStyle,
    textAlign: 'left' as const
  };
  
  return {
    chatWindowStyle: {
      display: "flex",
      flexDirection: "column" as const,
      height: "calc(100vh - 9rem)",
      width: "100%",
      backgroundColor: "transparent",
      position: "relative",
      zIndex: 1,
    },
    bodyStyle: {
      flexGrow: 1,
      overflowY: "auto" as const,
      backgroundColor: "transparent",
    },
    chatInputContainerStyle: chatInputContainerStyle,
    chatInputAreaStyle: {
      border: `1px solid ${
        currentTheme === 'cyberSpace' ? 'rgba(59, 130, 246, 0.7)' :
        currentTheme === 'sakuraTrees' ? 'rgba(235, 128, 176, 0.7)' :
        currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.7)' :
        currentTheme === 'mykonosBlue' ? 'rgba(76, 181, 230, 0.7)' :
        'var(--theme-border-color)'
      }`,
      borderRadius: "12px",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(255, 255, 255, 0.1)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(255, 255, 255, 0.2)' :
                     currentTheme === 'sunsetCity' ? 'rgba(255, 255, 255, 0.1)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(255, 255, 255, 0.2)' :
                     'rgba(255, 255, 255, 0.1)',
      color: "var(--theme-text-color)",
      width: "100%",
      boxShadow: `0 0 8px 2px rgba(0, 123, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)`,
      backdropFilter: "blur(5px)",
    },
    botBubbleStyle: messageBubbleStyles.botBubbleStyle,
    userBubbleStyle,
    headerStyle: {
      background: themeStyles.overlayBg,
      backdropFilter: "blur(5px)",
      borderBottom: "1px solid var(--theme-border-color)",
      padding: "0.75rem 1rem",
    },
    chatHistoryButtonStyle: {
      fontSize: "0.5rem !important", 
    },
  };
}; 