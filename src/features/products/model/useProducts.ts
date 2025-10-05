'use client';

import { useEntity } from '@/hooks/use-entity';
import { ProductAPI } from '../api/productApi';
import type { Product, ProductInsert, ProductUpdate } from '../api/productApi';

// Create singleton instance
const productAPI = new ProductAPI();

export function useProducts() {
  return useEntity<Product, ProductInsert, ProductUpdate>(productAPI);
}

export const useProductFilters = () => null;
export const useProductSearch = () => null;