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