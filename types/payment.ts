// types/payment.ts
export type PaymentMethod = 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET' | 'COD';

export interface PaymentDetails {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: string;
  razorpay_order_id?: string;
  razorpay_key?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key: string;
}

export interface RazorpayVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}