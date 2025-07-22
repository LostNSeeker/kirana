// app/profile/Profile.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import useThemeColor from '../../hooks/useThemeColor';

interface ProfileMenuItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  badge?: number;
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useThemeColor();
  
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  
  const profileMenuItems: ProfileMenuItem[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      icon: 'person',
      route: '/profile/personal-info',
    },
    {
      id: 'orders',
      title: 'Order History',
      icon: 'receipt-long',
      route: '/profile/order-history',
      badge: 2, // Example badge showing 2 recent orders
    },
    {
      id: 'tracking',
      title: 'Shipping & Tracking',
      icon: 'local-shipping',
      route: '/profile/shipping-tracking',
    },
    {
      id: 'support',
      title: 'Customer Support',
      icon: 'headset-mic',
      route: '/profile/customer-support',
    },
    {
      id: 'rate',
      title: 'Rate Our Service',
      icon: 'star',
      route: '/profile/rate-service',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      route: '/profile/settings',
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'description',
      route: '/profile/terms-conditions',
    },
  ];
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };
  
  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    setColorScheme(value ? 'dark' : 'light');
  };
  
  const navigateToRoute = (route: string) => {
    router.push(route);
  };
  
  const handleLoginSignup = () => {
    router.push('/auth/login');
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="My Profile" />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          {user && profile ? (
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatarPlaceholder, { borderColor }]}>
                    <ThemedText variant="h3">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </ThemedText>
                  </View>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <ThemedText variant="h4" weight="semibold">
                  {profile.full_name}
                </ThemedText>
                
                <ThemedText variant="body2">
                  {user.email}
                </ThemedText>
                
                {profile.phone && (
                  <ThemedText variant="body2">
                    {profile.phone}
                  </ThemedText>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigateToRoute('/profile/personal-info')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.signInContainer}>
              <ThemedText variant="h4" weight="semibold" style={styles.signInTitle}>
                Sign in to your account
              </ThemedText>
              
              <ThemedText variant="body" style={styles.signInText}>
                Sign in to view your profile, track orders, and more.
              </ThemedText>
              
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleLoginSignup}
                activeOpacity={0.7}
              >
                <ThemedText color="primary" variant="body" weight="semibold">
                  Sign In / Sign Up
                </ThemedText>
                <MaterialIcons name="arrow-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          )}
        </Card>
        
        {/* Dark Mode Toggle */}
        <Card style={styles.darkModeCard}>
          <View style={styles.darkModeContainer}>
            <View style={styles.darkModeTextContainer}>
              <MaterialIcons
                name={isDarkMode ? 'dark-mode' : 'light-mode'}
                size={24}
                color={textColor}
              />
              <ThemedText variant="body" weight="medium" style={styles.darkModeText}>
                Dark Mode
              </ThemedText>
            </View>
            
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
        
        {/* Profile Menu */}
        <Card style={styles.menuCard}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < profileMenuItems.length - 1 && styles.menuItemBorder,
                { borderBottomColor: borderColor },
              ]}
              onPress={() => navigateToRoute(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <MaterialIcons name={item.icon} size={24} color={textColor} />
                <ThemedText variant="body" style={styles.menuItemTitle}>
                  {item.title}
                </ThemedText>
              </View>
              
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <ThemedText variant="caption" style={styles.badgeText}>
                      {item.badge}
                    </ThemedText>
                  </View>
                )}
                <MaterialIcons name="chevron-right" size={24} color={textColor} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>
        
        {user && (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <MaterialIcons name="exit-to-app" size={24} color="#EF4444" />
            <ThemedText color="error" variant="body" weight="medium" style={styles.signOutText}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>
        )}
        
        <ThemedText variant="caption" style={styles.versionText}>
          App Version 1.0.0
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  userInfo: {
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  signInContainer: {
    alignItems: 'center',
    padding: 8,
  },
  signInTitle: {
    marginBottom: 8,
  },
  signInText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  darkModeCard: {
    marginBottom: 16,
  },
  darkModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkModeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeText: {
    marginLeft: 12,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  signOutText: {
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});