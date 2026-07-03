import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { adService } from '@/services/adService';
import type { Order, OrderStatus } from '@/lib/types';

export function useOrderByToken(trackingToken: string | undefined) {
  return useQuery({
    queryKey: ['order', 'token', trackingToken],
    queryFn: () => orderService.getByTrackingToken(trackingToken!),
    enabled: !!trackingToken,
  });
}

export function useCustomerOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'customer', customerId],
    queryFn: () => orderService.getOrdersByCustomer(customerId!),
    enabled: !!customerId,
  });
}

export function useAllOrders(filters?: { status?: OrderStatus; date?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'all', filters],
    queryFn: () => orderService.getAllOrders(filters),
  });

  useEffect(() => {
    // Admin needs to see all updates
    const unsub = orderService.subscribeToKitchenOrders(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
    });
    return unsub;
  }, [queryClient]);

  return query;
}

export function useKitchenOrders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'kitchen'],
    queryFn: () => orderService.getActiveKitchenOrders(),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const unsub = orderService.subscribeToKitchenOrders(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen'] });
    });
    return unsub;
  }, [queryClient]);

  return query;
}

export function useOrderRealtime(orderId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;
    const unsub = orderService.subscribeToOrder(orderId, (updated) => {
      queryClient.setQueryData(
        ['order', 'token', (updated as Order).tracking_token],
        (prev: Order | undefined) => (prev ? { ...prev, ...updated } : updated)
      );
    });
    return unsub;
  }, [orderId, queryClient]);
}

export function useActiveAds() {
  return useQuery({
    queryKey: ['ads', 'active'],
    queryFn: () => adService.getActiveAds(),
  });
}

export function useAllAds() {
  return useQuery({
    queryKey: ['ads', 'all'],
    queryFn: () => adService.getAllAds(),
  });
}

