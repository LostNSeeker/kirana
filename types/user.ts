// types/user.ts
export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    addresses?: ShippingAddress[];
    created_at: string;
    updated_at: string;
    preferences?: {
      newsletter: boolean;
      marketing: boolean;
      notifications: {
        order_updates: boolean;
        promotions: boolean;
        app_updates: boolean;
      };
    };
  }