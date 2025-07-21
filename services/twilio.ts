// services/twilio.ts
import axios from 'axios';
import { TWILIO_FUNCTION_URL } from '../constants/config';

export const sendOtp = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${TWILIO_FUNCTION_URL}/send-otp`, {
      phoneNumber,
    });
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
    };
  }
};

export const verifyOtp = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${TWILIO_FUNCTION_URL}/verify-otp`, {
      phoneNumber,
      code,
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    };
  }
};