import { z } from 'zod/v4';

// ─── Enums ───────────────────────────────────────────────────
export const UserRole = z.enum(['customer', 'chef', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const FoodSize = z.enum(['small', 'medium', 'large']);
export type FoodSize = z.infer<typeof FoodSize>;

export const OrderType = z.enum(['dine_in', 'takeaway', 'delivery']);
export type OrderType = z.infer<typeof OrderType>;

export const OrderStatus = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

// ─── Domain models ──────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface FoodItemPrice {
  id: string;
  food_item_id: string;
  size: FoodSize;
  price: number;
}

export interface FoodItemWithPrices extends FoodItem {
  prices: FoodItemPrice[];
  category?: Category;
}

export interface Advertisement {
  id: string;
  food_item_id: string;
  title: string;
  subtitle: string | null;
  banner_image_url: string | null;
  display_order: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  food_item?: FoodItemWithPrices;
}

export interface Order {
  id: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  order_type: OrderType;
  table_number: string | null;
  delivery_address: string | null;
  status: OrderStatus;
  cancellation_reason: string | null;
  total_amount: number;
  tracking_token: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  size: FoodSize;
  quantity: number;
  unit_price: number;
  subtotal: number;
  food_item?: FoodItem;
}

// ─── Cart (client-only) ─────────────────────────────────────

export interface CartItem {
  food_item_id: string;
  name: string;
  image_url: string | null;
  size: FoodSize;
  quantity: number;
  unit_price: number;
}

// ─── Form schemas ───────────────────────────────────────────

export const CheckoutFormSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_phone: z.string().min(7, 'Enter a valid phone number'),
  order_type: OrderType,
  table_number: z.string().optional(),
  delivery_address: z.string().optional(),
});
export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export const FoodItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().uuid(),
  is_available: z.boolean(),
  price_small: z.number().min(0),
  price_medium: z.number().min(0),
  price_large: z.number().min(0),
});
export type FoodItemFormData = z.infer<typeof FoodItemFormSchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  display_order: z.number().int().min(0),
});
export type CategoryFormData = z.infer<typeof CategoryFormSchema>;

export const AdFormSchema = z.object({
  food_item_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  display_order: z.number().int().min(0),
  active: z.boolean(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});
export type AdFormData = z.infer<typeof AdFormSchema>;

export interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  special_requests: string | null;
  payment_status: 'pending' | 'paid';
  payment_amount: number;
  verification_code: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  created_at: string;
}

// Minimal Database type for the Supabase generic client.
// Run `supabase gen types typescript` to replace with full generated types.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      categories: { Row: Category; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      food_items: { Row: FoodItem; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      food_item_prices: { Row: FoodItemPrice; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      advertisements: { Row: Advertisement; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      orders: { Row: Order; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      order_items: { Row: OrderItem; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      reservations: { Row: Reservation; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
