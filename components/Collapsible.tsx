import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import useThemeColor from '../hooks/useThemeColor';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'card' | 'bordered';
  testID?: string;
}

export default function Collapsible({
  title,
  children,
  initialExpanded = false,
  style,
  headerStyle,
  contentStyle,
  iconPosition = 'right',
  variant = 'default',
  testID,
}: CollapsibleProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, variant === 'card' ? 'cardBackground' : 'background');

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const variantStyles = {
    default: {},
    card: {
      backgroundColor,
      borderRadius: 8,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    bordered: {
      borderWidth: 1,
      borderColor,
      borderRadius: 8,
      marginVertical: 8,
    },
  };

  return (
    <View style={[styles.container, variantStyles[variant], style]} testID={testID}>
      <TouchableOpacity
        style={[styles.header, headerStyle]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {iconPosition === 'left' && (
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={textColor}
            style={styles.iconLeft}
          />
        )}
        <ThemedText weight="medium" style={styles.headerText}>
          {title}
        </ThemedText>
        {iconPosition === 'right' && (
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={textColor}
          />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
  },
  iconLeft: {
    marginRight: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});