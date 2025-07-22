// components/ui/Button.tsx
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import useThemeColor from '../../hooks/useThemeColor';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const backgroundColor = useThemeColor({
    light: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      outline: 'transparent',
      ghost: 'transparent',
      danger: '#EF4444',
    }[variant],
    dark: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      outline: 'transparent',
      ghost: 'transparent',
      danger: '#EF4444',
    }[variant],
  }, 'background');

  const textColor = useThemeColor({
    light: {
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      outline: '#3B82F6',
      ghost: '#3B82F6',
      danger: '#FFFFFF',
    }[variant],
    dark: {
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      outline: '#3B82F6',
      ghost: '#3B82F6',
      danger: '#FFFFFF',
    }[variant],
  }, 'text');

  const borderColor = useThemeColor({
    light: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      outline: '#3B82F6',
      ghost: 'transparent',
      danger: '#EF4444',
    }[variant],
    dark: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      outline: '#3B82F6',
      ghost: 'transparent',
      danger: '#EF4444',
    }[variant],
  }, 'border');

  const sizeStyles = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      fontSize: 16,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      fontSize: 18,
    },
  }[size];

  const buttonStyles: ViewStyle = {
    backgroundColor,
    borderColor,
    borderWidth: variant === 'outline' ? 1 : 0,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: sizeStyles.borderRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && iconPosition === 'left' && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={[
              {
                color: textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: '600',
                textAlign: 'center',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={{ marginLeft: 8 }}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}
