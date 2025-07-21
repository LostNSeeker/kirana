// hooks/useCart.ts
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { CartItem, ShippingAddress } from '../types/order';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  shippingAddress: ShippingAddress | null;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  saveShippingAddress: (address: ShippingAddress) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const { user } = useAuth();

  // Calculate derived values
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Load cart from storage on mount and user change
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (user) {
          // If user is logged in, try to get cart from database
          const { data, error } = await supabase
            .from('carts')
            .select('items, shipping_address')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            setItems(data.items || []);
            setShippingAddress(data.shipping_address || null);
            return;
          }
        }

        // Otherwise, load from local storage
        const storedItems = await AsyncStorage.getItem('cartItems');
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }

        const storedAddress = await AsyncStorage.getItem('shippingAddress');
        if (storedAddress) {
          setShippingAddress(JSON.parse(storedAddress));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();
  }, [user]);

  // Save cart when it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        if (user) {
          // If user is logged in, save to database
          const { error } = await supabase.from('carts').upsert(
            {
              user_id: user.id,
              items,
              shipping_address: shippingAddress,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          if (error) {
            console.error('Error saving cart to database:', error);
            // Fallback to local storage
            await AsyncStorage.setItem('cartItems', JSON.stringify(items));
            if (shippingAddress) {
              await AsyncStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
            }
          }
        } else {
          // Otherwise, save to local storage
          await AsyncStorage.setItem('cartItems', JSON.stringify(items));
          if (shippingAddress) {
            await AsyncStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
          }
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [items, shippingAddress, user]);

  const addItem = (product: Product, quantity: number) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(item => item.product_id === product.id);

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity,
          },
        ];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const saveShippingAddress = (address: ShippingAddress) => {
    setShippingAddress(address);
  };

  const value = {
    items,
    itemCount,
    totalPrice,
    shippingAddress,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveShippingAddress,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};