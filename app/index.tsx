// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/common/Header';
import ParallaxScrollView from '../components/ParallaxScrollView';
import useThemeColor from '../hooks/useThemeColor';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { fetchFeaturedProducts, fetchProducts } from '../services/products';
import { Product, ProductCategory } from '../types/product';
import { PRODUCT_CATEGORIES } from '../constants/config';
import { formatCurrency, getDiscountPercentage } from '../utils/formatting';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Banner data for the carousel
const BANNERS = [
  {
    id: '1',
    image: require('../assets/images/banner1.jpg'),
    title: 'Summer Sale',
    subtitle: 'Up to 50% off',
    actionUrl: '/category/clothing',
  },
  {
    id: '2',
    image: require('../assets/images/banner2.jpg'),
    title: 'New Electronics',
    subtitle: 'Latest gadgets',
    actionUrl: '/category/electronics',
  },
  {
    id: '3',
    image: require('../assets/images/banner3.jpg'),
    title: 'Home Decor',
    subtitle: 'Revamp your space',
    actionUrl: '/category/home',
  },
];

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeColor();
  const { user, profile } = useAuth();
  const { addItem } = useCart();
  
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load featured products
      const featured = await fetchFeaturedProducts(10);
      setFeaturedProducts(featured);
      
      // Load new arrivals
      const { products: newProducts } = await fetchProducts(
        undefined,
        8,
        0,
        undefined,
        'newest'
      );
      setNewArrivals(newProducts);
      
      // Load best sellers
      const { products: popularProducts } = await fetchProducts(
        undefined,
        8,
        0,
        undefined,
        'popularity'
      );
      setBestSellers(popularProducts);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleCategoryPress = (category: ProductCategory) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: category },
    });
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleAddToCart = (product: Product) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem(product, 1);
  };

  const renderBanner = ({ item, index }: { item: typeof BANNERS[0]; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bannerContainer}
        onPress={() => router.push(item.actionUrl)}
      >
        <Image source={item.image} style={styles.bannerImage} />
        <View style={styles.bannerContent}>
          <ThemedText variant="h3" weight="bold" style={styles.bannerTitle}>
            {item.title}
          </ThemedText>
          <ThemedText variant="body" style={styles.bannerSubtitle}>
            {item.subtitle}
          </ThemedText>
          <Button
            title="Shop Now"
            size="small"
            onPress={() => router.push(item.actionUrl)}
            style={styles.shopNowButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: typeof PRODUCT_CATEGORIES[0] }) => {
    return (
      <TouchableOpacity
        style={[styles.categoryItem, { backgroundColor: cardBackgroundColor }]}
        onPress={() => handleCategoryPress(item.id as ProductCategory)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIconContainer}>
          <MaterialIcons name={item.icon as any} size={24} color={primaryColor} />
        </View>
        <ThemedText variant="body2" style={styles.categoryName}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const discountPercentage = item.compare_at_price
      ? getDiscountPercentage(item.compare_at_price, item.price)
      : 0;

    return (
      <Card
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {item.is_new && (
            <View style={styles.newBadge}>
              <ThemedText variant="caption" style={styles.badgeText}>
                NEW
              </ThemedText>
            </View>
          )}
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText variant="caption" style={styles.badgeText}>
                {discountPercentage}% OFF
              </ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <ThemedText variant="body2" numberOfLines={1} style={styles.productName}>
            {item.name}
          </ThemedText>
          
          <View style={styles.priceContainer}>
            <ThemedText variant="body" weight="semibold" color="primary">
              {formatCurrency(item.price)}
            </ThemedText>
            
            {item.compare_at_price && item.compare_at_price > item.price && (
              <ThemedText
                variant="caption"
                style={styles.originalPrice}
              >
                {formatCurrency(item.compare_at_price)}
              </ThemedText>
            )}
          </View>
          
          {item.rating && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color="#F59E0B" />
              <ThemedText variant="caption" style={styles.ratingText}>
                {item.rating.average.toFixed(1)} ({item.rating.count})
              </ThemedText>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-shopping-cart" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Card>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {BANNERS.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { width: dotWidth, opacity, backgroundColor: primaryColor },
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <Header
        showCartIcon
        showSearchIcon
        onSearchPress={handleSearchPress}
        rightComponent={
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications-none" size={24} color={textColor} />
            {/* Notification badge if needed */}
          </TouchableOpacity>
        }
      />
      
      <ParallaxScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText variant="h4" weight="bold">
            {user && profile ? `Hi, ${profile.full_name.split(' ')[0]}! 👋` : 'Welcome! 👋'}
          </ThemedText>
          <ThemedText variant="body">
            {user && profile
              ? "Find today's best deals just for you!"
              : 'Discover amazing products at great prices'}
          </ThemedText>
        </View>
        
        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
          <FlatList
            data={BANNERS}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
          {renderPagination()}
        </View>
        
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h5" weight="semibold">
              Categories
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/categories')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body2">
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={PRODUCT_CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
        
        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h5" weight="semibold">
              Featured Products
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/featured')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body2">
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          />
        </View>
        
        {/* New Arrivals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h5" weight="semibold">
              New Arrivals
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/new-arrivals')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body2">
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={newArrivals}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          />
        </View>
        
        {/* Best Sellers */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h5" weight="semibold">
              Best Sellers
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/best-sellers')}
              activeOpacity={0.7}
            >
              <ThemedText color="primary" variant="body2">
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={bestSellers}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          />
        </View>
      </ParallaxScrollView>
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
  notificationButton: {
    padding: 8,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bannerSection: {
    marginBottom: 16,
  },
  bannerContainer: {
    width,
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerTitle: {
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  shopNowButton: {
    alignSelf: 'flex-start',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  categoryItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
  },
  productsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    padding: 0,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    marginLeft: 6,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});