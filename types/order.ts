// types/order.ts
export interface ShippingAddress {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    is_default?: boolean;
  }
  
  export interface CartItem {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url: string;
    attributes?: Record<string, string>;
  }
  
  export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'failed';
  
  export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
  
  export interface Order {
    id: string;
    user_id: string;
    customer_email: string;
    customer_name: string;
    shipping_address: ShippingAddress;
    items: CartItem[];
    subtotal_amount: number;
    shipping_amount: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method?: string;
    payment_status?: PaymentStatus;
    payment_gateway_order_id?: string;
    status: OrderStatus;
    shipment_id?: string;
    tracking_number?: string;
    tracking_url?: string;
    estimated_delivery_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }
  