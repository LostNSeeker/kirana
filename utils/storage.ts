// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in AsyncStorage
 * @param key Storage key
 * @param value Data to store
 * @returns Promise resolving to success or error
 */
export const storeData = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param key Storage key
 * @returns Promise resolving to stored data or null
 */
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    
    if (value === null) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch {
      // If not JSON, return as is
      return value as unknown as T;
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param key Storage key
 * @returns Promise resolving to success or error
 */
export const removeData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns Promise resolving to success or error
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Get all keys from AsyncStorage
 * @returns Promise resolving to array of keys or empty array
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/**
 * Store data with expiration time
 * @param key Storage key
 * @param value Data to store
 * @param expiryMinutes Expiration time in minutes
 * @returns Promise resolving to success or error
 */
export const storeWithExpiry = async (
  key: string,
  value: any,
  expiryMinutes: number
): Promise<boolean> => {
  try {
    const item = {
      value,
      expiry: Date.now() + expiryMinutes * 60 * 1000,
    };
    
    await storeData(key, item);
    return true;
  } catch (error) {
    console.error('Error storing data with expiry:', error);
    return false;
  }
};

/**
 * Get data with expiration check
 * @param key Storage key
 * @returns Promise resolving to stored data or null if expired
 */
export const getWithExpiry = async <T>(key: string): Promise<T | null> => {
  try {
    const itemStr = await getData<{ value: T; expiry: number }>(key);
    
    if (!itemStr) {
      return null;
    }
    
    // Return null if expired
    if (Date.now() > itemStr.expiry) {
      await removeData(key);
      return null;
    }
    
    return itemStr.value;
  } catch (error) {
    console.error('Error getting data with expiry:', error);
    return null;
  }
};