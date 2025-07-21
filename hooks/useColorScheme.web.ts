// hooks/useColorScheme.web.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function useColorScheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading theme:', error);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setColorScheme(e.matches ? 'dark' : 'light');
      }
    };

    // Set initial color scheme
    if (theme === 'system') {
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setColorScheme(theme);
    }

    // Add event listener for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setColorScheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      
      if (newTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setColorScheme(isDark ? 'dark' : 'light');
      } else {
        setColorScheme(newTheme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    colorScheme,
    theme,
    setColorScheme,
    isLoading,
  };
}