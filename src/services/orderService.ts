import { supabase } from '@/lib/supabaseClient';
import type { Order, OrderItem, OrderStatus, CartItem } from '@/lib/types';

export interface CreateOrderInput {
  customer_id?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: string;
  delivery_address?: string;
  items: CartItem[];
}

export interface OrderService {
  createOrder(input: CreateOrderInput): Promise<Order>;
  getByTrackingToken(token: string): Promise<Order>;
  getOrdersByTrackingTokens(tokens: string[]): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getAllOrders(filters?: { status?: OrderStatus; date?: string }): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus, reason?: string): Promise<void>;
  getActiveKitchenOrders(): Promise<Order[]>;
  subscribeToOrder(orderId: string, onChange: (order: Order) => void): () => void;
  subscribeToKitchenOrders(onChange: () => void): () => void;
}

export const orderService: OrderService = {
  async createOrder(input) {
    const orderPayload = {
      customer_id: input.customer_id ?? null,
      guest_name: input.guest_name ?? null,
      guest_phone: input.guest_phone ?? null,
      guest_email: input.guest_email ?? null,
      order_type: input.order_type,
      table_number: input.table_number ?? null,
      delivery_address: input.delivery_address ?? null,
      status: 'confirmed' as const,
      total_amount: 0,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    const typedOrder = order as Order;

    const itemRows = input.items.map((item) => ({
      order_id: typedOrder.id,
      food_item_id: item.food_item_id,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemRows);

    if (itemsError) throw new Error(itemsError.message);

    return this.getByTrackingToken(typedOrder.tracking_token);
  },

  async getByTrackingToken(token) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_token', token)
      .single();
    if (error) throw new Error(error.message);

    const order = data as Order;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, food_item:food_items(*)')
      .eq('order_id', order.id);
    if (itemsError) throw new Error(itemsError.message);

    return { ...order, items: items as OrderItem[] };
  },

  async getOrdersByTrackingTokens(tokens) {
    if (tokens.length === 0) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('tracking_token', tokens)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async getOrdersByCustomer(customerId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async getOrdersByEmail(email) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('guest_email', email)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async getAllOrders(filters) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date) {
      query = query.gte('created_at', `${filters.date}T00:00:00`).lte('created_at', `${filters.date}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  async updateStatus(orderId, status, reason) {
    const payload: Record<string, unknown> = { status };
    if (reason) payload.cancellation_reason = reason;

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  },

  async getActiveKitchenOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, food_item:food_items(*))')
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data as Order[];
  },

  subscribeToOrder(orderId, onChange) {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => onChange(payload.new as Order)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToKitchenOrders(onChange) {
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
