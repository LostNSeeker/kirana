// components/ui/Card.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import useThemeColor from '../../hooks/useThemeColor';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: number;
  padding?: number | string;
  margin?: number | string;
  borderRadius?: number;
  testID?: string;
}

export default function Card({
  children,
  style,
  onPress,
  elevation = 2,
  padding = 16,
  margin = 0,
  borderRadius = 12,
  testID,
}: CardProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const shadowColor = useThemeColor({}, 'shadow');

  const cardStyle: ViewStyle = {
    backgroundColor,
    padding,
    margin,
    borderRadius,
    shadowColor,
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation * 1.5,
    elevation,
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[cardStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      testID={testID}
    >
      {children}
    </CardComponent>
  );
}
