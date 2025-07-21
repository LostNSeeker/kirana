// services/products.ts
import { supabase } from './supabase';
import { Product, ProductCategory } from '../types/product';

export const fetchProducts = async (
  category?: ProductCategory,
  limit = 20,
  offset = 0,
  searchQuery?: string
): Promise<{ products: Product[]; count: number }> => {
  try {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return { products: data as Product[], count: count || 0 };
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data as Product;
  } catch (error) {
    console.error('Fetch product error:', error);
    throw error;
  }
};

export const fetchFeaturedProducts = async (limit = 10): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    return data as Product[];
  } catch (error) {
    console.error('Fetch featured products error:', error);
    throw error;
  }
};