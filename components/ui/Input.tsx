// components/ui/Input.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  KeyboardTypeOptions,
} from 'react-native';
import useThemeColor from '../../hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
  required?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  onPress,
  disabled = false,
  required = false,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholderText');
  const borderColor = useThemeColor(
    {
      light: error ? '#EF4444' : isFocused ? '#3B82F6' : '#E5E7EB',
      dark: error ? '#EF4444' : isFocused ? '#3B82F6' : '#4B5563',
    },
    'border'
  );
  const errorColor = useThemeColor({}, 'error');
  const disabledColor = useThemeColor({}, 'disabled');

  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(new Event('focus') as any);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(new Event('blur') as any);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderPasswordIcon = () => {
    return (
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
        <MaterialIcons
          name={showPassword ? 'visibility' : 'visibility-off'}
          size={24}
          color={placeholderColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              { color: error ? errorColor : textColor },
              labelStyle,
            ]}
          >
            {label}
            {required && <Text style={{ color: errorColor }}> *</Text>}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: disabled ? disabledColor : backgroundColor,
          },
          error && styles.errorInput,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: textColor,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          editable={!disabled && !onPress}
          selectTextOnFocus={!disabled}
        />
        {isPassword && renderPasswordIcon()}
        {rightIcon && !isPassword && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: errorColor }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    height: '100%',
    fontSize: 16,
  },
  errorInput: {
    borderWidth: 1,
  },
  iconContainer: {
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

