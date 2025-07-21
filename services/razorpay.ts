// services/razorpay.ts
import { RazorpayOrder, RazorpayVerification } from '../types/payment';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../constants/config';
import CryptoJS from 'crypto-js';
import api from './api';

// Helper to format Razorpay API requests
const razorpayApi = api.create({
  baseURL: 'https://api.razorpay.com/v1',
  auth: {
    username: RAZORPAY_KEY_ID,
    password: RAZORPAY_KEY_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export const razorpayCreateOrder = async (orderData: {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture: number;
}): Promise<RazorpayOrder> => {
  try {
    const response = await razorpayApi.post('/orders', orderData);
    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      receipt: response.data.receipt,
      key: RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error('Razorpay create order error:', error);
    throw error;
  }
};

export const razorpayVerifyPayment = async (payload: RazorpayVerification): Promise<boolean> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
    
    // Generate signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = CryptoJS.HmacSHA256(message, RAZORPAY_KEY_SECRET).toString(CryptoJS.enc.Hex);
    
    // Verify signature
    return generatedSignature === razorpay_signature;
  } catch (error) {
    console.error('Razorpay verify payment error:', error);
    throw error;
  }
};
