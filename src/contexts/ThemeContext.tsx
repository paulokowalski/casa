import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { lightTheme } from '../styles/theme';

interface ThemeContextType {
  theme: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const theme = useMemo(() => lightTheme, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
