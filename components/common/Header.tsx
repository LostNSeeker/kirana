import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useThemeColor from '../../hooks/useThemeColor';
import { useCart } from '../../hooks/useCart';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCartIcon?: boolean;
  showSearchIcon?: boolean;
  rightComponent?: React.ReactNode;
  onSearchPress?: () => void;
  transparent?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export default function Header({
  title,
  showBackButton = false,
  showCartIcon = false,
  showSearchIcon = false,
  rightComponent,
  onSearchPress,
  transparent = false,
  style,
  titleStyle,
  testID,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { itemCount } = useCart();

  const backgroundColor = useThemeColor(
    { light: transparent ? 'transparent' : '#FFFFFF', dark: transparent ? 'transparent' : '#1F2937' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleBackPress = () => {
    router.back();
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  return (
    <>
      <StatusBar
        barStyle={transparent ? 'light-content' : 'default'}
        translucent={transparent}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor,
            paddingTop: transparent ? insets.top : insets.top + 8,
            borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: borderColor,
          },
          style,
        ]}
        testID={testID}
      >
        <View style={styles.content}>
          <View style={styles.leftContainer}>
            {showBackButton && (
              <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                <MaterialIcons name="arrow-back" size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          {title && (
            <Text
              style={[styles.title, { color: textColor }, titleStyle]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}

          <View style={styles.rightContainer}>
            {showSearchIcon && (
              <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
                <MaterialIcons name="search" size={24} color={textColor} />
              </TouchableOpacity>
            )}

            {showCartIcon && (
              <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
                <View>
                  <MaterialIcons name="shopping-cart" size={24} color={textColor} />
                  {itemCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});