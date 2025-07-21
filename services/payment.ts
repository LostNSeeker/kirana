// services/payment.ts
import { Order, PaymentStatus } from '../types/order';
import { razorpayCreateOrder, razorpayVerifyPayment } from './razorpay';
import { supabase } from './supabase';
import { PaymentMethod, PaymentDetails } from '../types/payment';

export const initiatePayment = async (
  order: Order,
  paymentMethod: PaymentMethod
): Promise<PaymentDetails> => {
  try {
    // Create payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        amount: order.total_amount,
        currency: 'INR',
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayCreateOrder({
      amount: order.total_amount * 100, // Razorpay amount in paise
      currency: 'INR',
      receipt: `order_${order.id}`,
      payment_capture: 1,
    });

    // Update payment with razorpay order id
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_gateway_order_id: razorpayOrder.id,
      })
      .eq('id', data.id);

    if (updateError) {
      throw updateError;
    }

    return {
      id: data.id,
      order_id: order.id,
      amount: order.total_amount,
      currency: 'INR',
      payment_method: paymentMethod,
      status: 'pending',
      razorpay_order_id: razorpayOrder.id,
      razorpay_key: razorpayOrder.key,
    };
  } catch (error) {
    console.error('Initiate payment error:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  gatewayResponse?: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        payment_gateway_response: gatewayResponse,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
};

export const verifyPayment = async (
  paymentId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<boolean> => {
  try {
    // Verify payment with Razorpay
    const isValid = await razorpayVerifyPayment({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    });

    if (isValid) {
      // Update payment status
      await updatePaymentStatus(paymentId, 'completed', {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
      });
      return true;
    } else {
      await updatePaymentStatus(paymentId, 'failed', {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
        verification_result: 'invalid_signature',
      });
      return false;
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    await updatePaymentStatus(paymentId, 'failed', {
      error: String(error),
    });
    throw error;
  }
};
