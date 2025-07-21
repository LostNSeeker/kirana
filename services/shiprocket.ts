// services/shiprocket.ts
import { Order } from '../types/order';
import { SHIPROCKET_API_URL, SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD } from '../constants/config';
import axios from 'axios';

let shiprocketToken = '';
let tokenExpiry = 0;

// Create Shiprocket API instance
const shiprocketApi = axios.create({
  baseURL: SHIPROCKET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authenticate with Shiprocket API
const authenticateShiprocket = async (): Promise<string> => {
  // Check if token is still valid
  if (shiprocketToken && tokenExpiry > Date.now()) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    });

    shiprocketToken = response.data.token;
    // Set token expiry to 9 days (Shiprocket tokens are valid for 10 days)
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
    throw error;
  }
};

// Add auth token to requests
shiprocketApi.interceptors.request.use(
  async (config) => {
    const token = await authenticateShiprocket();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createShipment = async (order: Order): Promise<any> => {
  try {
    // Format order data for Shiprocket
    const shipmentData = {
      order_id: order.id,
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: "Primary",
      billing_customer_name: order.shipping_address.name,
      billing_last_name: "",
      billing_address: order.shipping_address.address_line1,
      billing_address_2: order.shipping_address.address_line2 || "",
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.pincode,
      billing_state: order.shipping_address.state,
      billing_country: "India",
      billing_email: order.customer_email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.product_name,
        sku: item.product_id,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.payment_method === "COD" ? "COD" : "Prepaid",
      sub_total: order.subtotal_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    const response = await shiprocketApi.post('/orders/create/adhoc', shipmentData);
    return response.data;
  } catch (error) {
    console.error('Create shipment error:', error);
    throw error;
  }
};

export const trackShipment = async (shipmentId: string): Promise<any> => {
  try {
    const response = await shiprocketApi.get(`/courier/track/shipment/${shipmentId}`);
    return response.data;
  } catch (error) {
    console.error('Track shipment error:', error);
    throw error;
  }
};

export const generateLabel = async (shipmentId: string): Promise<string> => {
  try {
    const response = await shiprocketApi.post('/courier/generate/label', {
      shipment_id: [shipmentId],
    });
    return response.data.label_url;
  } catch (error) {
    console.error('Generate label error:', error);
    throw error;
  }
};

export const cancelShipment = async (shipmentId: string): Promise<any> => {
  try {
    const response = await shiprocketApi.post('/orders/cancel', {
      ids: [shipmentId],
    });
    return response.data;
  } catch (error) {
    console.error('Cancel shipment error:', error);
    throw error;
  }
};
