// app/auth/register.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useThemeColor from '../../hooks/useThemeColor';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await signUp(email, password, {
        full_name: name,
        phone: phone,
        email: email,
      });
      
      if (success) {
        // Navigate to OTP verification screen if needed
        router.push({
          pathname: '/auth/otp',
          params: { email, phone },
        });
      } else {
        Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <ThemedText variant="h3" weight="bold" style={styles.title}>
            Create Account
          </ThemedText>
          
          <View style={styles.emptyContainer} />
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            leftIcon={<MaterialIcons name="person" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<MaterialIcons name="email" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="Phone Number"
            placeholder="Enter your 10-digit phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            leftIcon={<MaterialIcons name="phone" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="Password"
            placeholder="Create a password (min. 8 characters)"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<MaterialIcons name="lock" size={20} color={textColor} />}
            isPassword
            returnKeyType="next"
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            leftIcon={<MaterialIcons name="lock" size={20} color={textColor} />}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            required
          />

          <Button
            title={isSubmitting ? 'Creating Account...' : 'Create Account'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <ThemedText variant="body2">Already have an account? </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body2" weight="medium">
                Sign In
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  emptyContainer: {
    width: 40,
  },
  title: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});