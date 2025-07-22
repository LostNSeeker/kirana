// app/cart/checkout.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Button from '../../components/ui/Button';
import AddressForm from '../../components/forms/AddressForm';
import PaymentForm from '../../components/forms/PaymentForm';
import HapticTab from '../../components/HapticTab';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Order, ShippingAddress } from '../../types/order';
import { initiatePayment, verifyPayment } from '../../services/payment';
import { createShipment } from '../../services/shiprocket';
import { supabase } from '../../services/supabase';
import useThemeColor from '../../hooks/useThemeColor';

enum CheckoutStep {
  Address = 'address',
  Payment = 'payment',
}

export default function CheckoutScreen() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.Address);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  
  const { items, totalPrice, shippingAddress, saveShippingAddress, clearCart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Calculate order totals
  const subtotal = totalPrice;
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = subtotal * 0.18; // Assuming 18% GST
  const total = subtotal + shipping + tax;

  const handleAddressSubmit = async (address: ShippingAddress) => {
    // Save the address
    saveShippingAddress(address);
    
    // Move to payment step
    setCurrentStep(CheckoutStep.Payment);
  };

  const createOrder = async (): Promise<Order> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!shippingAddress) {
      throw new Error('Shipping address not found');
    }

    try {
      // Create order in the database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_email: user.email,
          customer_name: shippingAddress.name,
          shipping_address: shippingAddress,
          items: items,
          subtotal_amount: subtotal,
          shipping_amount: shipping,
          tax_amount: tax,
          total_amount: total,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!user || !shippingAddress) {
      Alert.alert('Error', 'Please sign in and provide shipping address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const newOrder = await createOrder();
      setOrder(newOrder);

      // Initiate payment
      const paymentDetails = await initiatePayment(newOrder, paymentData.method);

      // For COD, just update the order status
      if (paymentData.method === 'COD') {
        // Update order status
        await supabase
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'pending',
          })
          .eq('id', newOrder.id);

        // Create shipment
        await createShipment(newOrder);

        // Clear cart and navigate to success page
        clearCart();
        router.replace({
          pathname: '/payment/success',
          params: { orderId: newOrder.id },
        });
        return;
      }

      // For online payments, verify the payment
      const isVerified = await verifyPayment(
        paymentDetails.id,
        paymentData.razorpay_payment_id,
        paymentData.razorpay_order_id,
        paymentData.razorpay_signature
      );

      if (isVerified) {
        // Update order status
        await supabase
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'completed',
          })
          .eq('id', newOrder.id);

        // Create shipment
        await createShipment(newOrder);

        // Clear cart and navigate to success page
        clearCart();
        router.replace({
          pathname: '/payment/success',
          params: { orderId: newOrder.id },
        });
      } else {
        // Payment verification failed
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            payment_status: 'failed',
          })
          .eq('id', newOrder.id);

        router.replace({
          pathname: '/payment/failed',
          params: { orderId: newOrder.id },
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Failed', 'An error occurred while processing your payment. Please try again.');
      
      // Navigate to failure page if we have an order
      if (order) {
        router.replace({
          pathname: '/payment/failed',
          params: { orderId: order.id },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    Alert.alert('Payment Failed', 'An error occurred while processing your payment. Please try again.');
  };

  // If no items in cart, redirect to cart page
  if (items.length === 0) {
    router.replace('/cart');
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Checkout" showBackButton />

      {/* Checkout Steps */}
      <View style={styles.tabsContainer}>
        <HapticTab
          title="Address"
          active={currentStep === CheckoutStep.Address}
          onPress={() => setCurrentStep(CheckoutStep.Address)}
          icon={
            <MaterialIcons
              name="location-on"
              size={20}
              color={currentStep === CheckoutStep.Address ? '#3B82F6' : textColor}
            />
          }
          style={styles.tab}
        />
        <HapticTab
          title="Payment"
          active={currentStep === CheckoutStep.Payment}
          onPress={() => {
            if (shippingAddress) {
              setCurrentStep(CheckoutStep.Payment);
            } else {
              Alert.alert('Address Required', 'Please enter your shipping address first.');
            }
          }}
          icon={
            <MaterialIcons
              name="payment"
              size={20}
              color={currentStep === CheckoutStep.Payment ? '#3B82F6' : textColor}
            />
          }
          style={styles.tab}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === CheckoutStep.Address && (
            <AddressForm
              initialAddress={shippingAddress || undefined}
              onSubmit={handleAddressSubmit}
              submitButtonText="Continue to Payment"
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === CheckoutStep.Payment && order && (
            <PaymentForm
              order={order}
              onPaymentSuccess={handlePaymentSubmit}
              onPaymentError={handlePaymentError}
              isProcessing={isSubmitting}
            />
          )}

          {currentStep === CheckoutStep.Payment && !order && (
            <View style={styles.orderSummary}>
              <ThemedText variant="h4" weight="semibold" style={styles.sectionTitle}>
                Order Summary
              </ThemedText>
              
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal ({items.length} items)</ThemedText>
                <ThemedText>₹{subtotal.toFixed(2)}</ThemedText>
              </View>
              
              <View style={styles.summaryRow}>
                <ThemedText>Shipping</ThemedText>
                <ThemedText>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</ThemedText>
              </View>
              
              <View style={styles.summaryRow}>
                <ThemedText>Tax (18% GST)</ThemedText>
                <ThemedText>₹{tax.toFixed(2)}</ThemedText>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText variant="h5" weight="semibold">Total</ThemedText>
                <ThemedText variant="h5" weight="semibold">₹{total.toFixed(2)}</ThemedText>
              </View>
              
              <Button
                title="Place Order"
                onPress={async () => {
                  setIsSubmitting(true);
                  try {
                    const newOrder = await createOrder();
                    setOrder(newOrder);
                  } catch (error) {
                    console.error('Create order error:', error);
                    Alert.alert('Error', 'Failed to create order. Please try again.');
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                loading={isSubmitting}
                fullWidth
                style={styles.placeOrderButton}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  orderSummary: {
    paddingVertical: 16,
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
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    paddingTop: 16,
    marginBottom: 24,
  },
  placeOrderButton: {
    marginTop: 16,
  },
});