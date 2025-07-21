// hooks/useColorScheme.ts
import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

export default function useColorScheme() {
  const systemColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
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

  const setColorScheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Calculate the actual color scheme based on the theme setting
  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  return {
    colorScheme,
    theme,
    setColorScheme,
    isLoading,
  };
}
