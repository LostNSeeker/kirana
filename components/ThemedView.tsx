import React from 'react';
import { View, ViewProps } from 'react-native';
import useThemeColor from '../hooks/useThemeColor';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'elevated' | 'bordered';
}

export default function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...props
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === 'card' ? 'cardBackground' : 'background'
  );
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadow');

  const getVariantStyle = () => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor,
          borderRadius: 12,
          padding: 16,
        };
      case 'elevated':
        return {
          backgroundColor,
          borderRadius: 12,
          padding: 16,
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'bordered':
        return {
          backgroundColor,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor,
        };
      default:
        return { backgroundColor };
    }
  };

  return <View style={[getVariantStyle(), style]} {...props} />;
}
