import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import useThemeColor from '../hooks/useThemeColor';

interface HapticTabProps extends TouchableOpacityProps {
  title: string;
  active?: boolean;
  hapticFeedback?: boolean;
  badgeCount?: number;
  icon?: React.ReactNode;
  tabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeColor?: string;
  inactiveColor?: string;
}

export default function HapticTab({
  title,
  active = false,
  hapticFeedback = true,
  badgeCount,
  icon,
  style,
  tabStyle,
  textStyle,
  activeColor,
  inactiveColor,
  onPress,
  ...props
}: HapticTabProps) {
  const defaultActiveColor = useThemeColor({}, 'primary');
  const defaultInactiveColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const activeColorToUse = activeColor || defaultActiveColor;
  const inactiveColorToUse = inactiveColor || defaultInactiveColor;

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress && onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.tab,
        {
          borderBottomColor: active ? activeColorToUse : 'transparent',
          backgroundColor,
        },
        tabStyle,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.text,
            {
              color: active ? activeColorToUse : inactiveColorToUse,
              fontWeight: active ? '600' : '400',
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: activeColorToUse }]}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});