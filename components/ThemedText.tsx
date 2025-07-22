import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import useThemeColor from '../hooks/useThemeColor';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'body2' | 'caption' | 'button';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'text' | 'disabled' | string;
}

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'body',
  weight = 'normal',
  color = 'text',
  ...props
}: ThemedTextProps) {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 
    color === 'text' ? 'text' : color === 'primary' ? 'primary' : 
    color === 'secondary' ? 'secondary' : color === 'error' ? 'error' : 
    color === 'warning' ? 'warning' : color === 'success' ? 'success' : 
    color === 'disabled' ? 'disabled' : 'text');

  const variantStyles: Record<ThemedTextProps['variant'], TextStyle> = {
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
    h2: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
    h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    h4: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    h5: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    body2: { fontSize: 14, lineHeight: 22, fontWeight: '400' },
    caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
    button: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  };

  const weightStyles: Record<ThemedTextProps['weight'], { fontWeight: TextStyle['fontWeight'] }> = {
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        weightStyles[weight],
        { color: color.startsWith('#') ? color : textColor },
        style,
      ]}
      {...props}
    />
  );
}