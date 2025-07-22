
// app/cart/index.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Button from '../../components/ui/Button';
import { useCart } from '../../hooks/useCart';
import { CartItem } from '../../types/order';
import useThemeColor from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

export default function CartScreen() {
    const { items, totalPrice, updateQuantity, removeItem, clearCart, itemCount } = useCart();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
  
    const handleQuantityChange = (item: CartItem, newQuantity: number) => {
      if (newQuantity < 1) {
        handleRemoveItem(item);
        return;
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateQuantity(item.product_id, newQuantity);
    };
  
    const handleRemoveItem = (item: CartItem) => {
      Alert.alert(
        'Remove Item',
        `Are you sure you want to remove ${item.product_name} from your cart?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              removeItem(item.product_id);
            },
            style: 'destructive',
          },
        ]
      );
    };
  
    const handleClearCart = () => {
      if (items.length === 0) return;
      
      Alert.alert(
        'Clear Cart',
        'Are you sure you want to remove all items from your cart?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear All',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              clearCart();
            },
            style: 'destructive',
          },
        ]
      );
    };
  
    const handleCheckout = () => {
      router.push('/cart/checkout');
    };
  
    const renderCartItem = ({ item }: { item: CartItem }) => (
      <View style={[styles.cartItem, { borderColor }]}>
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <ThemedText variant="body" weight="medium" numberOfLines={2}>
            {item.product_name}
          </ThemedText>
          
          <ThemedText variant="h5" weight="semibold" color="primary" style={styles.priceText}>
            ₹{item.price.toFixed(2)}
          </ThemedText>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor }]}
              onPress={() => handleQuantityChange(item, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="remove" size={16} color={textColor} />
            </TouchableOpacity>
            
            <ThemedText variant="body2" weight="semibold" style={styles.quantityText}>
              {item.quantity}
            </ThemedText>
            
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor }]}
              onPress={() => handleQuantityChange(item, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={16} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  
    return (
      <ThemedView style={styles.container}>
        <Header
          title="Shopping Cart"
          showBackButton
          rightComponent={
            items.length > 0 ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
                activeOpacity={0.7}
              >
                <ThemedText color="error" variant="body2">
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            ) : undefined
          }
        />
  
        {items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <MaterialIcons name="shopping-cart" size={80} color="#A0A0A0" />
            <ThemedText variant="h4" weight="semibold" style={styles.emptyCartTitle}>
              Your cart is empty
            </ThemedText>
            <ThemedText variant="body" style={styles.emptyCartText}>
              Looks like you haven't added any items to your cart yet.
            </ThemedText>
            <Button
              title="Start Shopping"
              onPress={() => router.push('/')}
              style={styles.shopNowButton}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.product_id}
              contentContainerStyle={[
                styles.cartListContent, 
                { paddingBottom: insets.bottom + 150 }
              ]}
              showsVerticalScrollIndicator={false}
            />
  
            <View
              style={[
                styles.checkoutContainer,
                {
                  backgroundColor,
                  paddingBottom: insets.bottom || 16,
                },
              ]}
            >
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <ThemedText variant="body">Subtotal ({itemCount} items)</ThemedText>
                  <ThemedText variant="body" weight="semibold">
                    ₹{totalPrice.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View style={styles.summaryRow}>
                  <ThemedText variant="body">Shipping</ThemedText>
                  <ThemedText variant="body">
                    {totalPrice >= 500 ? 'Free' : '₹50.00'}
                  </ThemedText>
                </View>
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <ThemedText variant="h5" weight="semibold">
                    Total
                  </ThemedText>
                  <ThemedText variant="h5" weight="bold" color="primary">
                    ₹{(totalPrice + (totalPrice >= 500 ? 0 : 50)).toFixed(2)}
                  </ThemedText>
                </View>
              </View>
              
              <Button
                title="Proceed to Checkout"
                onPress={handleCheckout}
                fullWidth
                style={styles.checkoutButton}
              />
            </View>
          </>
        )}
      </ThemedView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    clearButton: {
      padding: 8,
    },
    cartListContent: {
      padding: 16,
    },
    cartItem: {
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    productInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    priceText: {
      marginVertical: 4,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityText: {
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      padding: 8,
      justifyContent: 'center',
    },
    emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyCartTitle: {
      marginTop: 16,
      marginBottom: 8,
    },
    emptyCartText: {
      textAlign: 'center',
      marginBottom: 24,
      opacity: 0.7,
    },
    shopNowButton: {
      minWidth: 150,
    },
    checkoutContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
      padding: 16,
    },
    summaryContainer: {
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
      paddingTop: 12,
      marginTop: 4,
    },
    checkoutButton: {
      marginTop: 8,
    },
  });