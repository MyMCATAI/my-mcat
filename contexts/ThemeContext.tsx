import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultTheme: ThemeContextType = {
  theme: 'cyberSpace',
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('cyberSpace');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
