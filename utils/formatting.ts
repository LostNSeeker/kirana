// utils/formatting.ts
/**
 * Format a number as Indian currency (INR)
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Format a date to a readable string
   * @param date The date to format
   * @param format The format to use (short, medium, long)
   * @returns Formatted date string
   */
  export const formatDate = (date: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'short' : 'long',
      day: 'numeric',
    };
    
    if (format === 'long') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('en-IN', options);
  };
  
  /**
   * Get the discount percentage from original and discounted price
   * @param originalPrice The original price
   * @param discountedPrice The discounted price
   * @returns Discount percentage as an integer
   */
  export const getDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
    if (!originalPrice || originalPrice <= 0 || !discountedPrice || discountedPrice >= originalPrice) {
      return 0;
    }
    
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };
  
  /**
   * Truncate a string with ellipsis if it exceeds maxLength
   * @param str The string to truncate
   * @param maxLength Maximum length before truncation
   * @returns Truncated string
   */
  export const truncateString = (str: string, maxLength: number): string => {
    if (!str || str.length <= maxLength) {
      return str;
    }
    
    return str.slice(0, maxLength) + '...';
  };
  
  /**
   * Format a phone number with proper spacing
   * @param phone The phone number to format
   * @returns Formatted phone number
   */
  export const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as per Indian phone number (10 digits)
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    
    // If it has country code (e.g., +91)
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return '+91 ' + cleaned.substring(2).replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    
    // Return as is if it doesn't match expected formats
    return phone;
  };