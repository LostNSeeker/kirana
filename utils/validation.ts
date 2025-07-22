// utils/validation.ts
/**
 * Validate an email address
 * @param email Email to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a phone number (10 digits for Indian numbers)
   * @param phone Phone number to validate
   * @returns True if valid, false otherwise
   */
  export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };
  
  /**
   * Validate a password meets minimum requirements
   * @param password Password to validate
   * @returns True if valid, false otherwise
   */
  export const isValidPassword = (password: string): boolean => {
    // At least 8 characters, with at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Validate an Indian PIN code (6 digits)
   * @param pincode Pincode to validate
   * @returns True if valid, false otherwise
   */
  export const isValidPincode = (pincode: string): boolean => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  };
  
  /**
   * Get validation error message for a field
   * @param fieldName Name of the field being validated
   * @param value Value to validate
   * @param rules Validation rules to apply
   * @returns Error message or empty string if valid
   */
  export const getValidationError = (
    fieldName: string,
    value: string,
    rules: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      isEmail?: boolean;
      isPhone?: boolean;
      isPassword?: boolean;
      isPincode?: boolean;
      match?: { field: string; value: string };
    }
  ): string => {
    // Required field check
    if (rules.required && (!value || value.trim() === '')) {
      return `${fieldName} is required`;
    }
    
    // Skip other validations if value is empty and not required
    if (!value || value.trim() === '') {
      return '';
    }
    
    // Minimum length check
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }
    
    // Maximum length check
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} cannot exceed ${rules.maxLength} characters`;
    }
    
    // Email format check
    if (rules.isEmail && !isValidEmail(value)) {
      return `Please enter a valid email address`;
    }
    
    // Phone format check
    if (rules.isPhone && !isValidPhone(value)) {
      return `Please enter a valid 10-digit phone number`;
    }
    
    // Password strength check
    if (rules.isPassword && !isValidPassword(value)) {
      return `Password must be at least 8 characters with uppercase, lowercase, and numbers`;
    }
    
    // Pincode check
    if (rules.isPincode && !isValidPincode(value)) {
      return `Please enter a valid 6-digit pincode`;
    }
    
    // Field matching check (e.g., confirm password)
    if (rules.match && value !== rules.match.value) {
      return `${fieldName} does not match ${rules.match.field}`;
    }
    
    return '';
  };
  