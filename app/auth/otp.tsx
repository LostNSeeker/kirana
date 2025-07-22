// app/auth/otp.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Button from '../../components/ui/Button';
import useThemeColor from '../../hooks/useThemeColor';
import { sendOtp, verifyOtp } from '../../services/twilio';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string; email: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    // Start the countdown timer for OTP resend
    if (timeLeft > 0 && !canResend) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleOtpChange = (text: string, index: number) => {
    // Ensure input is a single digit
    if (text.length > 1) {
      text = text.charAt(0);
    }
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Move to next input if current input is filled
    if (text.length === 1 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const { phone } = params;
      if (!phone) {
        Alert.alert('Error', 'Phone number not found. Please try again.');
        return;
      }
      
      const { success, message } = await sendOtp(phone);
      
      if (success) {
        setTimeLeft(30);
        setCanResend(false);
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
      } else {
        Alert.alert('Error', message || 'Could not send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit verification code.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { phone } = params;
      if (!phone) {
        Alert.alert('Error', 'Phone number not found. Please try again.');
        return;
      }
      
      const { success, message } = await verifyOtp(phone, otpCode);
      
      if (success) {
        Alert.alert('Success', 'Phone number verified successfully!', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('Verification Failed', message || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
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
            Verify Phone
          </ThemedText>
          
          <View style={styles.emptyContainer} />
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.instructions}>
            Enter the 4-digit verification code sent to{' '}
            {params.phone ? params.phone : 'your phone number'}.
          </ThemedText>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit ? primaryColor : borderColor,
                    color: textColor,
                  },
                ]}
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={primaryColor}
              />
            ))}
          </View>
          
          <Button
            title={isSubmitting ? 'Verifying...' : 'Verify'}
            onPress={handleVerifyOtp}
            disabled={isSubmitting || otp.join('').length !== 4}
            loading={isSubmitting}
            fullWidth
            style={styles.verifyButton}
          />
          
          <View style={styles.resendContainer}>
            <ThemedText variant="body2">Didn't receive the code? </ThemedText>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                <ThemedText color="primary" variant="body2" weight="medium">
                  Resend Code
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <ThemedText variant="body2">
                Resend in <ThemedText weight="semibold">{timeLeft}s</ThemedText>
              </ThemedText>
            )}
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
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});