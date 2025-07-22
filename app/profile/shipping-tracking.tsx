// app/profile/shipping-tracking.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import useThemeColor from '../../hooks/useThemeColor';
import { supabase } from '../../services/supabase';
import { trackShipment, generateLabel } from '../../services/shiprocket';
import { Order } from '../../types/order';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';

interface TrackingData {
  current_status: string;
  shipment_status_date: string;
  shipment_track_activities: Array<{
    date: string;
    activity: string;
    location: string;
  }>;
}

enum OrderStatusColor {
  'pending' = '#F59E0B', // Amber
  'processing' = '#3B82F6', // Blue
  'shipped' = '#8B5CF6', // Purple
  'delivered' = '#10B981', // Green
  'cancelled' = '#EF4444', // Red
  'returned' = '#6B7280', // Gray
}

export default function ShippingTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ orderId: string }>();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (params.orderId && orders.length > 0) {
      const order = orders.find(o => o.id === params.orderId);
      if (order) {
        setSelectedOrder(order);
        fetchTrackingData(order);
      }
    }
  }, [params.orderId, orders]);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data as Order[]);

      // If no order is selected but we have orders, select the most recent one
      if (!selectedOrder && data.length > 0) {
        const recentOrder = data[0] as Order;
        setSelectedOrder(recentOrder);
        fetchTrackingData(recentOrder);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrackingData = async (order: Order) => {
    if (!order.shipment_id) {
      setTrackingData(null);
      return;
    }

    setTrackingLoading(true);

    try {
      const data = await trackShipment(order.shipment_id);
      setTrackingData(data);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      Alert.alert('Error', 'Could not fetch tracking information. Please try again later.');
      setTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleDownloadLabel = async () => {
    if (!selectedOrder?.shipment_id) {
      Alert.alert('Error', 'Shipping label is not available for this order.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const labelUrl = await generateLabel(selectedOrder.shipment_id);
      
      if (labelUrl) {
        Linking.openURL(labelUrl);
      } else {
        Alert.alert('Error', 'Could not generate shipping label. Please try again later.');
      }
    } catch (error) {
      console.error('Error generating label:', error);
      Alert.alert('Error', 'Could not generate shipping label. Please try again later.');
    }
  };

  const handleContactSupport = () => {
    router.push('/profile/customer-support');
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'local-shipping';
      case 'shipped':
        return 'local-shipping';
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'returned':
        return 'assignment-return';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string): string => {
    return OrderStatusColor[status as keyof typeof OrderStatusColor] || '#6B7280';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Shipping & Tracking" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Shipping & Tracking" showBackButton />
        <View style={styles.signInPrompt}>
          <MaterialIcons name="lock" size={64} color="#A0A0A0" />
          <ThemedText variant="h4" weight="semibold" style={styles.signInTitle}>
            Sign in to track your orders
          </ThemedText>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/login')}
            style={styles.signInButton}
          />
        </View>
      </ThemedView>
    );
  }

  if (orders.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Shipping & Tracking" showBackButton />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.emptyOrdersContainer}>
            <MaterialIcons name="inbox" size={64} color="#A0A0A0" />
            <ThemedText variant="h4" weight="semibold" style={styles.emptyOrdersTitle}>
              No orders found
            </ThemedText>
            <ThemedText variant="body" style={styles.emptyOrdersText}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </ThemedText>
            <Button
              title="Start Shopping"
              onPress={() => router.push('/')}
              style={styles.shopNowButton}
            />
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Shipping & Tracking" showBackButton />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Order Selector */}
        <View style={styles.orderSelectorContainer}>
          <ThemedText variant="body" weight="medium" style={styles.sectionTitle}>
            Select Order
          </ThemedText>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.orderCardsContainer}
          >
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderCard,
                  selectedOrder?.id === order.id && styles.selectedOrderCard,
                  {
                    borderColor: selectedOrder?.id === order.id
                      ? primaryColor
                      : borderColor,
                  },
                ]}
                onPress={() => {
                  setSelectedOrder(order);
                  fetchTrackingData(order);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.orderCardHeader}>
                  <MaterialIcons
                    name={renderStatusIcon(order.status)}
                    size={20}
                    color={getStatusColor(order.status)}
                  />
                  <ThemedText
                    variant="caption"
                    style={[styles.orderStatus, { color: getStatusColor(order.status) }]}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </ThemedText>
                </View>
                
                <ThemedText variant="body2" weight="medium">
                  Order #{order.id.substring(0, 8)}
                </ThemedText>
                
                <ThemedText variant="caption" style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString()}
                </ThemedText>
                
                <ThemedText variant="body2" weight="semibold" color="primary">
                  ₹{order.total_amount.toFixed(2)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Selected Order Details */}
        {selectedOrder && (
          <Card style={styles.orderDetailsCard}>
            <View style={styles.cardHeader}>
              <ThemedText variant="h4" weight="semibold">
                Order Details
              </ThemedText>
              
              {selectedOrder.shipment_id && (
                <Button
                  title="Download Label"
                  variant="outline"
                  size="small"
                  onPress={handleDownloadLabel}
                  icon={<MaterialIcons name="download" size={16} color={primaryColor} />}
                />
              )}
            </View>
            
            <View style={styles.orderInfoContainer}>
              <View style={styles.orderInfoRow}>
                <ThemedText variant="body2">Order ID:</ThemedText>
                <ThemedText variant="body2" weight="medium">
                  #{selectedOrder.id.substring(0, 8)}
                </ThemedText>
              </View>
              
              <View style={styles.orderInfoRow}>
                <ThemedText variant="body2">Date:</ThemedText>
                <ThemedText variant="body2">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </ThemedText>
              </View>
              
              <View style={styles.orderInfoRow}>
                <ThemedText variant="body2">Items:</ThemedText>
                <ThemedText variant="body2">
                  {selectedOrder.items.length} item(s)
                </ThemedText>
              </View>
              
              <View style={styles.orderInfoRow}>
                <ThemedText variant="body2">Total:</ThemedText>
                <ThemedText variant="body2" weight="semibold" color="primary">
                  ₹{selectedOrder.total_amount.toFixed(2)}
                </ThemedText>
              </View>
              
              <View style={styles.orderInfoRow}>
                <ThemedText variant="body2">Status:</ThemedText>
                <View style={styles.statusContainer}>
                  <MaterialIcons
                    name={renderStatusIcon(selectedOrder.status)}
                    size={16}
                    color={getStatusColor(selectedOrder.status)}
                  />
                  <ThemedText
                    variant="body2"
                    weight="medium"
                    style={[
                      styles.statusText,
                      { color: getStatusColor(selectedOrder.status) },
                    ]}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View style={[styles.divider, { borderBottomColor: borderColor }]} />
            
            <View style={styles.addressContainer}>
              <ThemedText variant="body" weight="medium" style={styles.addressTitle}>
                Shipping Address
              </ThemedText>
              
              <ThemedText variant="body2" weight="semibold">
                {selectedOrder.shipping_address.name}
              </ThemedText>
              
              <ThemedText variant="body2">
                {selectedOrder.shipping_address.address_line1}
                {selectedOrder.shipping_address.address_line2
                  ? `, ${selectedOrder.shipping_address.address_line2}`
                  : ''}
              </ThemedText>
              
              <ThemedText variant="body2">
                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
              </ThemedText>
              
              <ThemedText variant="body2">
                Phone: {selectedOrder.shipping_address.phone}
              </ThemedText>
            </View>
          </Card>
        )}
        
        {/* Tracking Information */}
        {selectedOrder && (
          <Card style={styles.trackingCard}>
            <ThemedText variant="h4" weight="semibold" style={styles.trackingTitle}>
              Tracking Information
            </ThemedText>
            
            {trackingLoading ? (
              <View style={styles.trackingLoadingContainer}>
                <ActivityIndicator size="small" color={primaryColor} />
                <ThemedText variant="body2" style={styles.trackingLoadingText}>
                  Loading tracking information...
                </ThemedText>
              </View>
            ) : selectedOrder.shipment_id && trackingData ? (
              <View style={styles.trackingContainer}>
                <View style={styles.currentStatusContainer}>
                  <ThemedText variant="body" weight="semibold">
                    Current Status:
                  </ThemedText>
                  <ThemedText
                    variant="body"
                    weight="medium"
                    style={[
                      styles.currentStatusText,
                      { color: getStatusColor(selectedOrder.status) },
                    ]}
                  >
                    {trackingData.current_status}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.statusDate}>
                    Last updated: {new Date(trackingData.shipment_status_date).toLocaleString()}
                  </ThemedText>
                </View>
                
                <View style={styles.trackingTimelineContainer}>
                  {trackingData.shipment_track_activities?.map((activity, index) => (
                    <View
                      key={index}
                      style={[
                        styles.timelineItem,
                        index < trackingData.shipment_track_activities.length - 1 &&
                          styles.timelineItemWithLine,
                      ]}
                    >
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              index === 0 ? getStatusColor(selectedOrder.status) : borderColor,
                          },
                        ]}
                      />
                      
                      {index < trackingData.shipment_track_activities.length - 1 && (
                        <View
                          style={[styles.timelineLine, { backgroundColor: borderColor }]}
                        />
                      )}
                      
                      <View style={styles.timelineContent}>
                        <ThemedText variant="body2" weight={index === 0 ? 'semibold' : 'medium'}>
                          {activity.activity}
                        </ThemedText>
                        
                        <View style={styles.timelineSubContent}>
                          <ThemedText variant="caption" style={styles.timelineLocation}>
                            {activity.location}
                          </ThemedText>
                          <ThemedText variant="caption" style={styles.timelineDate}>
                            {new Date(activity.date).toLocaleString()}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noTrackingContainer}>
                <MaterialIcons name="local-shipping" size={48} color="#A0A0A0" />
                <ThemedText variant="body" style={styles.noTrackingText}>
                  {selectedOrder.status === 'pending' || selectedOrder.status === 'processing'
                    ? "Your order is being processed. Tracking information will be available once your order is shipped."
                    : "No tracking information available for this order."}
                </ThemedText>
                <Button
                  title="Contact Support"
                  variant="outline"
                  onPress={handleContactSupport}
                  style={styles.contactSupportButton}
                />
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  signInTitle: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  signInButton: {
    minWidth: 150,
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyOrdersTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyOrdersText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    maxWidth: 300,
  },
  shopNowButton: {
    minWidth: 150,
  },
  orderSelectorContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  orderCardsContainer: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  orderCard: {
    width: 150,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  selectedOrderCard: {
    borderWidth: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderStatus: {
    marginLeft: 4,
  },
  orderDate: {
    marginVertical: 4,
    opacity: 0.7,
  },
  orderDetailsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfoContainer: {
    marginBottom: 16,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
  },
  divider: {
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressTitle: {
    marginBottom: 8,
  },
  trackingCard: {
    marginBottom: 16,
  },
  trackingTitle: {
    marginBottom: 16,
  },
  trackingLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  trackingLoadingText: {
    marginLeft: 8,
  },
  trackingContainer: {
    marginBottom: 8,
  },
  currentStatusContainer: {
    marginBottom: 16,
  },
  currentStatusText: {
    marginTop: 4,
  },
  statusDate: {
    marginTop: 2,
    opacity: 0.7,
  },
  trackingTimelineContainer: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 16,
  },
  timelineItemWithLine: {
    paddingBottom: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: '100%',
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
  },
  timelineSubContent: {
    marginTop: 4,
  },
  timelineLocation: {
    marginBottom: 2,
  },
  timelineDate: {
    opacity: 0.7,
  },
  noTrackingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noTrackingText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  contactSupportButton: {
    minWidth: 150,
  },
});