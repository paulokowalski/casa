import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { darkTheme } from '../styles/theme';

interface ThemeContextType {
  theme: any;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const theme = useMemo(() => darkTheme, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 