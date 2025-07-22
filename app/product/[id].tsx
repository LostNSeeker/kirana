// app/product/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/Collapsible';
import useThemeColor from '../../hooks/useThemeColor';
import { useCart } from '../../hooks/useCart';
import { fetchProductById } from '../../services/products';
import { Product } from '../../types/product';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { addItem } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!id) {
          throw new Error('Product ID is required');
        }
        
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem(product, quantity);
    
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => router.push('/cart'),
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        title: product.name,
        message: `Check out this product: ${product.name} - ${product.description}`,
        url: `https://myapp.com/product/${product.id}`,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product && newQuantity > product.stock_quantity) {
      Alert.alert('Maximum Quantity', `Sorry, only ${product.stock_quantity} items are available.`);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color="#EF4444" />
        <ThemedText variant="h4" style={styles.errorText}>
          {error || 'Product not found'}
        </ThemedText>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.goBackButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            backgroundColor,
            opacity: headerOpacity,
            paddingTop: insets.top,
          },
        ]}
      >
        <Header
          title={product.name}
          showBackButton
          showCartIcon
          style={styles.header}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Floating back button for hero image */}
        <View style={[styles.floatingBackButton, { top: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Floating cart button for hero image */}
        <View style={[styles.floatingCartButton, { top: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="shopping-cart" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Product Images Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
        >
          {product.images ? (
            product.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
        </ScrollView>

        {/* Image Pagination Indicators */}
        {product.images && product.images.length > 1 && (
          <View style={styles.paginationContainer}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === selectedImageIndex ? primaryColor : 'rgba(0, 0, 0, 0.2)',
                  },
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Product Info */}
          <View style={styles.productInfoContainer}>
            <View style={styles.nameAndPriceContainer}>
              <ThemedText variant="h3" weight="semibold" style={styles.productName}>
                {product.name}
              </ThemedText>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <MaterialIcons name="share" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.priceContainer}>
              <ThemedText variant="h4" weight="bold" color="primary">
                ₹{product.price.toFixed(2)}
              </ThemedText>
              
              {product.compare_at_price && product.compare_at_price > product.price && (
                <View style={styles.discountContainer}>
                  <ThemedText
                    variant="body"
                    style={styles.originalPrice}
                  >
                    ₹{product.compare_at_price.toFixed(2)}
                  </ThemedText>
                  
                  <ThemedText
                    variant="body2"
                    weight="semibold"
                    color="success"
                    style={styles.discountPercentage}
                  >
                    {Math.round(
                      ((product.compare_at_price - product.price) / product.compare_at_price) * 100
                    )}% OFF
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Stock Status */}
            <View style={styles.stockContainer}>
              {product.stock_quantity > 0 ? (
                <View style={styles.inStockContainer}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <ThemedText variant="body2" color="success" style={styles.stockText}>
                    In Stock ({product.stock_quantity} available)
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.outOfStockContainer}>
                  <MaterialIcons name="cancel" size={16} color="#EF4444" />
                  <ThemedText variant="body2" color="error" style={styles.stockText}>
                    Out of Stock
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Product Description */}
            <ThemedText variant="body" style={styles.descriptionText}>
              {product.description}
            </ThemedText>

            {/* Product Details Collapsible */}
            <Collapsible
              title="Product Details"
              initialExpanded={true}
              style={styles.collapsible}
            >
              <View style={styles.detailsContainer}>
                {product.features && product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check" size={18} color={primaryColor} />
                    <ThemedText variant="body" style={styles.featureText}>
                      {feature}
                    </ThemedText>
                  </View>
                ))}
                
                {Object.entries(product.attributes || {}).map(([key, value]) => (
                  <View key={key} style={styles.attributeRow}>
                    <ThemedText variant="body2" weight="medium" style={styles.attributeKey}>
                      {key}:
                    </ThemedText>
                    <ThemedText variant="body2" style={styles.attributeValue}>
                      {value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Collapsible>

            {/* Shipping Information Collapsible */}
            <Collapsible
              title="Shipping & Returns"
              style={styles.collapsible}
            >
              <View style={styles.shippingContainer}>
                <View style={styles.shippingItem}>
                  <MaterialIcons name="local-shipping" size={20} color={textColor} />
                  <ThemedText variant="body" style={styles.shippingText}>
                    Free shipping on orders over ₹500
                  </ThemedText>
                </View>
                
                <View style={styles.shippingItem}>
                  <MaterialIcons name="access-time" size={20} color={textColor} />
                  <ThemedText variant="body" style={styles.shippingText}>
                    Delivery within 3-5 business days
                  </ThemedText>
                </View>
                
                <View style={styles.shippingItem}>
                  <MaterialIcons name="replay" size={20} color={textColor} />
                  <ThemedText variant="body" style={styles.shippingText}>
                    Easy 30-day returns and exchanges
                  </ThemedText>
                </View>
              </View>
            </Collapsible>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Add to Cart Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor,
            paddingBottom: insets.bottom || 16,
          },
        ]}
      >
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="remove"
              size={20}
              color={quantity <= 1 ? '#A0A0A0' : textColor}
            />
          </TouchableOpacity>
          
          <ThemedText variant="body" weight="semibold" style={styles.quantityText}>
            {quantity}
          </ThemedText>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(quantity + 1)}
            disabled={product.stock_quantity <= quantity}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="add"
              size={20}
              color={product.stock_quantity <= quantity ? '#A0A0A0' : textColor}
            />
          </TouchableOpacity>
        </View>

        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          disabled={product.stock_quantity === 0}
          style={styles.addToCartButton}
          icon={<MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />}
        />
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  goBackButton: {
    minWidth: 120,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  floatingCartButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageCarousel: {
    width,
    height: width * 0.8,
  },
  productImage: {
    width,
    height: width * 0.8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: width * 0.8 - 20,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom bar
  },
  productInfoContainer: {
    paddingTop: 24,
  },
  nameAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    marginRight: 16,
  },
  shareButton: {
    padding: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 8,
    opacity: 0.7,
  },
  discountPercentage: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  stockContainer: {
    marginBottom: 16,
  },
  inStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 6,
  },
  descriptionText: {
    marginBottom: 24,
    lineHeight: 22,
  },
  collapsible: {
    marginBottom: 16,
  },
  detailsContainer: {
    paddingTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  attributeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attributeKey: {
    width: '30%',
  },
  attributeValue: {
    flex: 1,
  },
  shippingContainer: {
    paddingTop: 8,
  },
  shippingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shippingText: {
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    marginLeft: 16,
  },
});