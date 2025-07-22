// components/forms/LoginForm.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';
import { useAuth } from '../../hooks/useAuth';
import useThemeColor from '../../hooks/useThemeColor';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export default function LoginForm({ 
  onSuccess, 
  onForgotPassword, 
  onRegister 
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

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

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await signIn(email, password);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace('/');
        }
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      router.push('/auth/forgot-password');
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.formContainer}>
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
          onBlur={validateEmail}
          leftIcon={<MaterialIcons name="email" size={20} color={textColor} />}
          returnKeyType="next"
          required
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          onBlur={validatePassword}
          leftIcon={<MaterialIcons name="lock" size={20} color={textColor} />}
          isPassword
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          required
        />

        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={handleForgotPassword}
          activeOpacity={0.7}
        >
          <ThemedText color="primary" variant="body2">
            Forgot Password?
          </ThemedText>
        </TouchableOpacity>

        <Button
          title={isSubmitting ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          fullWidth
          style={styles.submitButton}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText variant="body2">Don't have an account? </ThemedText>
        <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
          <ThemedText color="primary" variant="body2" weight="medium">
            Sign Up
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formContainer: {
    marginBottom: 24,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});

// components/forms/AddressForm.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';
import { useCart } from '../../hooks/useCart';
import { MaterialIcons } from '@expo/vector-icons';
import { ShippingAddress } from '../../types/order';
import useThemeColor from '../../hooks/useThemeColor';

interface AddressFormProps {
  initialAddress?: ShippingAddress;
  onSubmit: (address: ShippingAddress) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

export default function AddressForm({
  initialAddress,
  onSubmit,
  submitButtonText = 'Save Address',
  isSubmitting = false,
}: AddressFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (initialAddress) {
      setName(initialAddress.name || '');
      setPhone(initialAddress.phone || '');
      setAddressLine1(initialAddress.address_line1 || '');
      setAddressLine2(initialAddress.address_line2 || '');
      setCity(initialAddress.city || '');
      setState(initialAddress.state || '');
      setPincode(initialAddress.pincode || '');
    }
  }, [initialAddress]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const addressData: ShippingAddress = {
        name,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        pincode,
      };
      
      onSubmit(addressData);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            label="Address Line 1"
            placeholder="House No, Building, Street"
            value={addressLine1}
            onChangeText={setAddressLine1}
            error={errors.addressLine1}
            leftIcon={<MaterialIcons name="home" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="Address Line 2"
            placeholder="Area, Landmark (Optional)"
            value={addressLine2}
            onChangeText={setAddressLine2}
            leftIcon={<MaterialIcons name="place" size={20} color={textColor} />}
            returnKeyType="next"
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            leftIcon={<MaterialIcons name="location-city" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="State"
            placeholder="Enter your state"
            value={state}
            onChangeText={setState}
            error={errors.state}
            leftIcon={<MaterialIcons name="map" size={20} color={textColor} />}
            returnKeyType="next"
            required
          />

          <Input
            label="Pincode"
            placeholder="Enter your 6-digit pincode"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
            error={errors.pincode}
            leftIcon={<MaterialIcons name="pin-drop" size={20} color={textColor} />}
            returnKeyType="done"
            maxLength={6}
            onSubmitEditing={handleSubmit}
            required
          />

          <Button
            title={submitButtonText}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formContainer: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
  },
});
