/**
 * Get theme-specific styles for chat bubbles, overlays, and inputs
 */
export const getThemeBubbleStyles = (currentTheme: string) => {
  switch(currentTheme) {
    case 'sakuraTrees':
      return {
        botBubbleBg: 'rgba(251, 240, 248, 0.85)',
        userBubbleBg: 'rgba(196, 122, 155, 0.85)',
        overlayBg: 'rgba(250, 238, 244, 0.3)',
        inputBg: 'rgba(251, 240, 248, 0.6)'
      };
    case 'sunsetCity':
      return {
        botBubbleBg: 'rgba(36, 23, 58, 0.85)',
        userBubbleBg: 'rgba(255, 99, 71, 0.85)',
        overlayBg: 'rgba(36, 23, 58, 0.3)',
        inputBg: 'rgba(36, 23, 58, 0.6)'
      };
    case 'mykonosBlue':
      return {
        botBubbleBg: 'rgba(231, 250, 251, 0.85)',
        userBubbleBg: 'rgba(30, 129, 176, 0.85)',
        overlayBg: 'rgba(231, 250, 251, 0.3)',
        inputBg: 'rgba(231, 250, 251, 0.6)'
      };
    default: // cyberSpace
      return {
        botBubbleBg: 'rgba(0, 18, 38, 0.85)',
        userBubbleBg: 'rgba(0, 122, 252, 0.85)',
        overlayBg: 'rgba(0, 18, 38, 0.3)',
        inputBg: 'rgba(0, 18, 38, 0.6)'
      };
  }
};

/**
 * Get theme-specific CSS properties for styling chat bubbles
 */
export const getChatInputContainerStyle = (currentTheme: string) => {
  return {
    position: 'sticky' as const,
    bottom: 0,
    backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 0, 0, 0.3)' :
                   currentTheme === 'sakuraTrees' ? 'rgba(251, 240, 248, 0.3)' :
                   currentTheme === 'sunsetCity' ? 'rgba(36, 23, 58, 0.3)' :
                   currentTheme === 'mykonosBlue' ? 'rgba(231, 250, 251, 0.3)' :
                   'rgba(0, 0, 0, 0.3)',
    backdropFilter: "blur(10px)",
    borderTop: `2px solid ${
      currentTheme === 'cyberSpace' ? 'rgba(59, 130, 246, 0.5)' :
      currentTheme === 'sakuraTrees' ? 'rgba(235, 128, 176, 0.5)' :
      currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.5)' :
      currentTheme === 'mykonosBlue' ? 'rgba(76, 181, 230, 0.5)' :
      'var(--theme-border-color)'
    }`,
    padding: "1rem",
    width: "100%",
    zIndex: 2,
    boxShadow: currentTheme === 'cyberSpace' ? "0 -5px 15px -5px rgba(0, 123, 255, 0.2)" :
              currentTheme === 'sakuraTrees' ? "0 -5px 15px -5px rgba(255, 0, 89, 0.2)" :
              currentTheme === 'sunsetCity' ? "0 -5px 15px -5px rgba(255, 99, 71, 0.2)" :
              currentTheme === 'mykonosBlue' ? "0 -5px 15px -5px rgba(30, 129, 176, 0.2)" :
              "0 -5px 15px -5px rgba(0, 0, 0, 0.1)",
  };
};

/**
 * Get theme-specific styles for message bubbles
 */
export const getMessageBubbleStyles = (currentTheme: string) => {
  const themeStyles = getThemeBubbleStyles(currentTheme);
  
  return {
    botBubbleStyle: {
      fontSize: "1rem",
      fontWeight: "500",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "var(--theme-text-color)",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 18, 38, 0.95)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(251, 240, 248, 0.95)' :
                     currentTheme === 'sunsetCity' ? 'rgba(36, 23, 58, 0.95)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(231, 250, 251, 0.95)' :
                     themeStyles.botBubbleBg,
      backdropFilter: "blur(10px)",
      boxShadow: currentTheme === 'cyberSpace' ? "0 0 8px 2px rgba(0, 123, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sakuraTrees' ? "0 0 8px 2px rgba(255, 0, 89, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sunsetCity' ? "0 0 10px 3px rgba(255, 99, 71, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'mykonosBlue' ? "0 0 8px 4px rgba(30, 129, 176, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                "0 2px 4px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem 0.75rem 0.75rem 0.25rem",
      borderLeft: currentTheme === 'cyberSpace' ? "3px solid #3b82f6" :
                 currentTheme === 'sakuraTrees' ? "3px solid #eb80b0" :
                 currentTheme === 'sunsetCity' ? "3px solid #ff9baf" :
                 currentTheme === 'mykonosBlue' ? "3px solid #4cb5e6" :
                 "3px solid var(--theme-hover-color)",
    },
    userBubbleStyle: {
      fontSize: "1rem",
      fontWeight: "500",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      color: "white",
      backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 122, 252, 0.95)' :
                     currentTheme === 'sakuraTrees' ? 'rgba(196, 122, 155, 0.95)' :
                     currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.95)' :
                     currentTheme === 'mykonosBlue' ? 'rgba(30, 129, 176, 0.95)' :
                     themeStyles.userBubbleBg,
      backdropFilter: "blur(10px)",
      boxShadow: currentTheme === 'cyberSpace' ? "0 0 8px 2px rgba(0, 123, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sakuraTrees' ? "0 0 8px 2px rgba(255, 0, 89, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'sunsetCity' ? "0 0 10px 3px rgba(255, 99, 71, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                currentTheme === 'mykonosBlue' ? "0 0 8px 4px rgba(30, 129, 176, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)" :
                "0 2px 4px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem 0.75rem 0.25rem 0.75rem",
      borderRight: currentTheme === 'cyberSpace' ? "3px solid #007afc" :
                  currentTheme === 'sakuraTrees' ? "3px solid #b85475" :
                  currentTheme === 'sunsetCity' ? "3px solid #ff6347" :
                  currentTheme === 'mykonosBlue' ? "3px solid #1e81b0" :
                  "3px solid var(--theme-hover-color)",
      textAlign: "left",
    }
  };
}; 