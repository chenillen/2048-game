'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = '2048' | '4096';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  tileBackground: string;
  tileBorder: string;
  textColor: string;
}

interface Theme {
  name: ThemeName;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const themes: Record<ThemeName, Theme> = {
  '2048': {
    name: '2048',
    colors: {
      primary: '#f9f6f2',
      secondary: '#776e65',
      background: '#faf8ef',
      tileBackground: '#eee4da',
      tileBorder: '#bbada0',
      textColor: '#776e65',
    },
  },
  '4096': {
    name: '4096',
    colors: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      background: '#1a1a2e',
      tileBackground: '#16213e',
      tileBorder: '#0f3460',
      textColor: '#e94560',
    },
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: themes['2048'],
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('2048');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as ThemeName;
      if (saved && themes[saved]) {
        setThemeName(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeName);
      localStorage.setItem('theme', themeName);
    }
  }, [themeName]);

  const setTheme = (theme: Theme) => {
    setThemeName(theme.name);
  };

  const toggleTheme = () => {
    setThemeName((prev) => (prev === '2048' ? '4096' : '2048'));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
