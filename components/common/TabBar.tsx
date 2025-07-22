import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import useThemeColor from '../../hooks/useThemeColor';
import TabBarBackground from './TabBarBackground';

// Define the tab icons
const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'home',
  categories: 'category',
  search: 'search',
  favorites: 'favorite',
  profile: 'person',
};

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const activeColor = useThemeColor({}, 'primary');
  const inactiveColor = useThemeColor({}, 'tabIconDefault');
  
  // Track the previously focused tab for animation
  const prevFocusedTab = useSharedValue(state.index);
  
  // If the focused tab changes, animate the change
  if (prevFocusedTab.value !== state.index) {
    prevFocusedTab.value = withTiming(state.index, { duration: 200 });
  }

  return (
    <View style={[styles.container, { backgroundColor, paddingBottom: insets.bottom }]}>
      <TabBarBackground />
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          
          // Get icon name from mapping or use default
          const iconName: keyof typeof MaterialIcons.glyphMap = 
            TAB_ICONS[route.name.toLowerCase()] || 'circle';

          // Animation for tab items
          const tabAnimStyle = useAnimatedStyle(() => {
            const isSelected = index === Math.round(prevFocusedTab.value);
            
            return {
              transform: [
                {
                  translateY: withSpring(isSelected ? -8 : 0, {
                    damping: 20,
                    stiffness: 300,
                  }),
                },
                {
                  scale: withSpring(isSelected ? 1.1 : 1, {
                    damping: 20,
                    stiffness: 300,
                  }),
                },
              ],
            };
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
              key={route.key}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabContent, tabAnimStyle]}>
                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                  <MaterialIcons
                    name={iconName}
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                </View>
                {isFocused && (
                  <Text 
                    style={[styles.label, { color: activeColor }]} 
                    numberOfLines={1}
                  >
                    {label.toString()}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});