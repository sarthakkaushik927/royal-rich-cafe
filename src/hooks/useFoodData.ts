"use client";
import { useQuery } from '@tanstack/react-query';
import { foodService } from '@/services/foodService';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => foodService.getCategories(),
  });
}

export function useFoodItemsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['food-items', 'category', categoryId],
    queryFn: () => foodService.getFoodItemsByCategory(categoryId!),
    enabled: !!categoryId,
  });
}

export function useAllFoodItems() {
  return useQuery({
    queryKey: ['food-items', 'all'],
    queryFn: () => foodService.getAllFoodItems(),
  });
}

export function useFoodItem(itemId: string | undefined) {
  return useQuery({
    queryKey: ['food-items', itemId],
    queryFn: () => foodService.getFoodItem(itemId!),
    enabled: !!itemId,
  });
}
