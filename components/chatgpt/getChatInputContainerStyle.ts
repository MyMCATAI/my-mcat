export const getChatInputContainerStyle = (currentTheme: string) => {
  return {
    position: 'sticky' as const,
    bottom: 0,
    backgroundColor: currentTheme === 'cyberSpace' ? 'rgba(0, 0, 0, 0.3)' :
                   currentTheme === 'sakuraTrees' ? 'rgba(251, 240, 248, 0.3)' :
                   currentTheme === 'sunsetCity' ? 'rgba(36, 23, 58, 0.3)' :
                   currentTheme === 'mykonosBlue' ? 'rgba(231, 250, 251, 0.3)' :
                   currentTheme === 'cleanWhite' ? 'rgba(255, 255, 255, 0.3)' :
                   'rgba(0, 0, 0, 0.3)',
    backdropFilter: "blur(10px)",
    borderTop: `2px solid ${
      currentTheme === 'cyberSpace' ? 'rgba(59, 130, 246, 0.5)' :
      currentTheme === 'sakuraTrees' ? 'rgba(235, 128, 176, 0.5)' :
      currentTheme === 'sunsetCity' ? 'rgba(255, 99, 71, 0.5)' :
      currentTheme === 'mykonosBlue' ? 'rgba(76, 181, 230, 0.5)' :
      currentTheme === 'cleanWhite' ? 'rgba(195, 255, 254, 0.84)' :
      'var(--theme-border-color)'
    }`,
    padding: "1rem",
    width: "100%",
    zIndex: 2,
    boxShadow: currentTheme === 'cyberSpace' ? "0 -5px 15px -5px rgba(0, 123, 255, 0.2)" :
              currentTheme === 'sakuraTrees' ? "0 -5px 15px -5px rgba(255, 0, 89, 0.2)" :
              currentTheme === 'sunsetCity' ? "0 -5px 15px -5px rgba(255, 99, 71, 0.2)" :
              currentTheme === 'mykonosBlue' ? "0 -5px 15px -5px rgba(30, 129, 176, 0.2)" :
              currentTheme === 'cleanWhite' ? "0 -5px 15px -5px rgba(42, 178, 176, 0.2)" :
              "0 -5px 15px -5px rgba(0, 0, 0, 0.1)",
  };
}; 