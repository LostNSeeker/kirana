// components/forms/PaymentForm.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { RAZORPAY_KEY_ID } from '../../constants/config';
import useThemeColor from '../../hooks/useThemeColor';
import { Order } from '../../types/order';
import { PaymentMethod } from '../../types/payment';

// Mock function to simulate Razorpay integration
// In a real app, you would use the actual Razorpay SDK
const openRazorpayCheckout = async (
  options: any,
  onSuccess: (data: any) => void,
  onError: (error: any) => void
) => {
  // This is just a mock implementation
  // In a real app, you would use the Razorpay.open() method
  console.log('Opening Razorpay with options:', options);
  
  try {
    // Simulate a successful payment
    setTimeout(() => {
      onSuccess({
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpay_order_id: options.order_id,
        razorpay_signature: 'signature_' + Math.random().toString(36).substr(2, 9),
      });
    }, 2000);
  } catch (error) {
    onError(error);
  }
};

interface PaymentFormProps {
  order: Order;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: any) => void;
  isProcessing?: boolean;
}

export default function PaymentForm({
  order,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARD');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const paymentMethods = [
    { id: 'CARD', label: 'Credit/Debit Card', icon: 'credit-card' },
    { id: 'UPI', label: 'UPI', icon: 'account-balance' },
    { id: 'NETBANKING', label: 'Net Banking', icon: 'account-balance' },
    { id: 'WALLET', label: 'Wallet', icon: 'account-balance-wallet' },
    { id: 'COD', label: 'Cash On Delivery', icon: 'local-shipping' },
  ];

  const handlePayment = () => {
    if (selectedMethod === 'COD') {
      // Handle COD payment
      onPaymentSuccess({
        method: 'COD',
        status: 'pending',
      });
      return;
    }

    // For all other payment methods, use Razorpay
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.total_amount * 100, // amount in paisa
      currency: 'INR',
      name: 'Your Shop Name',
      description: `Order #${order.id}`,
      order_id: order.payment_gateway_order_id,
      prefill: {
        name: order.shipping_address.name,
        contact: order.shipping_address.phone,
        email: order.customer_email,
      },
      theme: {
        color: primaryColor,
      },
    };

    try {
      openRazorpayCheckout(
        options,
        (data) => {
          onPaymentSuccess({
            method: selectedMethod,
            status: 'completed',
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });
        },
        (error) => {
          console.error('Payment error:', error);
          onPaymentError(error);
        }
      );
    } catch (error) {
      console.error('Razorpay error:', error);
      onPaymentError(error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orderSummary}>
          <ThemedText variant="h4" weight="semibold" style={styles.sectionTitle}>
            Order Summary
          </ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText>Subtotal</ThemedText>
            <ThemedText>₹{order.subtotal_amount.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText>Shipping</ThemedText>
            <ThemedText>₹{order.shipping_amount.toFixed(2)}</ThemedText>
          </View>
          
          {order.discount_amount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText>Discount</ThemedText>
              <ThemedText color="success">-₹{order.discount_amount.toFixed(2)}</ThemedText>
            </View>
          )}
          
          {order.tax_amount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText>Tax</ThemedText>
              <ThemedText>₹{order.tax_amount.toFixed(2)}</ThemedText>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText variant="h5" weight="semibold">Total</ThemedText>
            <ThemedText variant="h5" weight="semibold">₹{order.total_amount.toFixed(2)}</ThemedText>
          </View>
        </View>

        <View style={styles.paymentMethodsContainer}>
          <ThemedText variant="h4" weight="semibold" style={styles.sectionTitle}>
            Payment Method
          </ThemedText>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                {
                  borderColor: method.id === selectedMethod ? primaryColor : borderColor,
                  backgroundColor,
                },
              ]}
              onPress={() => setSelectedMethod(method.id as PaymentMethod)}
              disabled={isProcessing}
            >
              <View style={styles.methodContent}>
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={method.id === selectedMethod ? primaryColor : textColor}
                  style={styles.methodIcon}
                />
                <ThemedText weight={method.id === selectedMethod ? 'semibold' : 'normal'}>
                  {method.label}
                </ThemedText>
              </View>
              
              <View
                style={[
                  styles.radioButton,
                  {
                    borderColor: method.id === selectedMethod ? primaryColor : borderColor,
                  },
                ]}
              >
                {method.id === selectedMethod && (
                  <View
                    style={[styles.radioButtonSelected, { backgroundColor: primaryColor }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Razorpay logo for online payments */}
        {selectedMethod !== 'COD' && (
          <View style={styles.poweredByContainer}>
            <ThemedText variant="caption">Powered by</ThemedText>
            <Image
              source={require('../../assets/images/razorpay-logo.png')}
              style={styles.paymentProviderLogo}
              resizeMode="contain"
            />
          </View>
        )}

        <Button
          title={
            isProcessing
              ? 'Processing...'
              : selectedMethod === 'COD'
              ? 'Place Order'
              : 'Proceed to Pay'
          }
          onPress={handlePayment}
          disabled={isProcessing}
          loading={isProcessing}
          fullWidth
          style={styles.payButton}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  orderSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paymentProviderLogo: {
    height: 24,
    width: 100,
    marginLeft: 8,
  },
  payButton: {
    marginBottom: 24,
  },
});