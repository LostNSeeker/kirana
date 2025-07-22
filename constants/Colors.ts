// constants/Colors.ts
const tintColorLight = '#3B82F6'; // Primary blue color
const tintColorDark = '#60A5FA';

export default {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    cardBackground: '#F9FAFB',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    primary: '#3B82F6',
    secondary: '#6B7280',
    border: '#E5E7EB',
    notification: '#EF4444',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    disabled: '#F3F4F6',
    placeholderText: '#9CA3AF',
    shadow: '#000000',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    cardBackground: '#1F2937',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    border: '#374151',
    notification: '#EF4444',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    disabled: '#1F2937',
    placeholderText: '#6B7280',
    shadow: '#000000',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// constants/config.ts
// Configuration variables for the app

// API URLs
export const API_URL = 'https://api.yourdomain.com/v1';

// Supabase Configuration
export const SUPABASE_URL = 'YOUR_SUPABASE_URL';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Razorpay Configuration
export const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
export const RAZORPAY_KEY_SECRET = 'YOUR_RAZORPAY_KEY_SECRET';

// ShipRocket Configuration
export const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1';
export const SHIPROCKET_EMAIL = 'YOUR_SHIPROCKET_EMAIL';
export const SHIPROCKET_PASSWORD = 'YOUR_SHIPROCKET_PASSWORD';

// Twilio Configuration
export const TWILIO_FUNCTION_URL = 'https://your-twilio-function-domain.twil.io';

// App Configuration
export const APP_NAME = 'YourShopName';
export const APP_VERSION = '1.0.0';
export const CONTACT_EMAIL = 'support@yourdomain.com';
export const CONTACT_PHONE = '+1234567890';
export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/yourshop',
  instagram: 'https://instagram.com/yourshop',
  twitter: 'https://twitter.com/yourshop',
};

// Feature Flags
export const FEATURES = {
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_GUEST_CHECKOUT: true,
  ENABLE_WISHLISTS: true,
  ENABLE_PRODUCT_REVIEWS: true,
  ENABLE_CHAT_SUPPORT: false, // Coming soon
  ENABLE_VOICE_SEARCH: false, // Coming soon
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'devices',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: 'checkroom',
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    icon: 'home',
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    icon: 'spa',
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    icon: 'fitness-center',
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: 'menu-book',
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: 'toys',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    icon: 'local-grocery-store',
  },
];

// Payment Methods
export const PAYMENT_METHODS = [
  {
    id: 'CARD',
    name: 'Credit/Debit Card',
    icon: 'credit-card',
  },
  {
    id: 'UPI',
    name: 'UPI',
    icon: 'account-balance',
  },
  {
    id: 'NETBANKING',
    name: 'Net Banking',
    icon: 'account-balance',
  },
  {
    id: 'WALLET',
    name: 'Wallet',
    icon: 'account-balance-wallet',
  },
  {
    id: 'COD',
    name: 'Cash On Delivery',
    icon: 'local-shipping',
  },
];