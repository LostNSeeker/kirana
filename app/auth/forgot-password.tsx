// app/auth/forgot-password.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await resetPassword(email);
      
      if (success) {
        setResetSent(true);
      } else {
        Alert.alert('Error', 'Could not send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
            Reset Password
          </ThemedText>
          
          <View style={styles.emptyContainer} />
        </View>

        {resetSent ? (
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
            </View>
            
            <ThemedText variant="h4" weight="semibold" style={styles.successTitle}>
              Email Sent
            </ThemedText>
            
            <ThemedText style={styles.successMessage}>
              We've sent password reset instructions to {email}. Please check your email.
            </ThemedText>
            
            <Button
              title="Back to Login"
              onPress={() => router.push('/auth/login')}
              fullWidth
              style={styles.backToLoginButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <ThemedText style={styles.instructions}>
              Enter your email address and we'll send you instructions to reset your password.
            </ThemedText>
            
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={emailError}
              leftIcon={<MaterialIcons name="email" size={20} color={textColor} />}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              required
            />

            <Button
              title={isSubmitting ? 'Sending...' : 'Reset Password'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              fullWidth
              style={styles.submitButton}
            />

            <TouchableOpacity
              style={styles.backToLoginLink}
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body" weight="medium">
                Back to Login
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
  instructions: {
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  submitButton: {
    marginTop: 24,
  },
  backToLoginLink: {
    alignSelf: 'center',
    marginTop: 24,
    padding: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  backToLoginButton: {
    marginTop: 16,
  },
});
