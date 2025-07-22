// types/product.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    compare_at_price?: number;
    image_url: string;
    images?: string[];
    category: ProductCategory;
    subcategory?: string;
    tags?: string[];
    stock_quantity: number;
    is_featured: boolean;
    is_new: boolean;
    is_on_sale: boolean;
    rating?: {
      average: number;
      count: number;
    };
    attributes?: Record<string, string>;
    features?: string[];
    shipping_weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    created_at: string;
    updated_at: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  }
  
  export type ProductCategory =
    | 'electronics'
    | 'clothing'
    | 'home'
    | 'beauty'
    | 'sports'
    | 'books'
    | 'toys'
    | 'grocery'
    | 'other';
  
  export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    user_name: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    is_verified_purchase: boolean;
    created_at: string;
    updated_at: string;
    helpful_votes?: number;
  }
  
  export interface ProductFilter {
    categories?: ProductCategory[];
    price_range?: {
      min: number;
      max: number;
    };
    rating?: number;
    is_on_sale?: boolean;
    is_in_stock?: boolean;
    sort_by?:
      | 'price_asc'
      | 'price_desc'
      | 'newest'
      | 'rating'
      | 'popularity'
      | 'relevance';
    tags?: string[];
    attributes?: Record<string, string[]>;
  }