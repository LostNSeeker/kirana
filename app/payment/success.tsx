// app/payment/success.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Button from '../../components/ui/Button';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../services/supabase';
import { Order } from '../../types/order';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Play success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Start animations
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Fetch order details if orderId is provided
    if (params.orderId) {
      fetchOrderDetails();
    }
  }, []);
  
  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.orderId)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        return;
      }
      
      setOrder(data as Order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  
  const handleTrackOrder = () => {
    router.push({
      pathname: '/profile/shipping-tracking',
      params: { orderId: params.orderId },
    });
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just placed an order #${params.orderId} on MyShop! Can't wait to receive it!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <MaterialIcons name="check-circle" size={100} color="#4CAF50" />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: opacityAnim,
              transform: [
                {
                  translateY: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedText variant="h3" weight="bold" style={styles.title}>
            Order Successful!
          </ThemedText>
          
          <ThemedText variant="body" style={styles.message}>
            Thank you for your purchase. Your order has been placed successfully.
          </ThemedText>
          
          {order && (
            <View style={styles.orderInfoContainer}>
              <ThemedText variant="body" weight="semibold">
                Order #{order.id.substring(0, 8)}
              </ThemedText>
              
              <ThemedText variant="body2" style={styles.orderDate}>
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </ThemedText>
              
              <View style={styles.totalContainer}>
                <ThemedText variant="body">Total:</ThemedText>
                <ThemedText variant="body" weight="semibold">
                  ₹{order.total_amount.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          )}
        </Animated.View>
        
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: opacityAnim,
              transform: [
                {
                  translateY: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Button
            title="Track Order"
            onPress={handleTrackOrder}
            fullWidth
            style={styles.trackButton}
          />
          
          <Button
            title="Continue Shopping"
            onPress={() => router.replace('/')}
            variant="outline"
            fullWidth
            style={styles.continueButton}
          />
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={20} color="#3B82F6" />
            <ThemedText color="primary" variant="body2" style={styles.shareText}>
              Share your purchase
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  orderInfoContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
  },
  orderDate: {
    marginTop: 4,
    marginBottom: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  trackButton: {
    marginBottom: 16,
  },
  continueButton: {
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  shareText: {
    marginLeft: 8,
  },
});