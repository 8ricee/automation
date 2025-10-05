'use client';

import { useState } from 'react';
import { useEntity } from '@/hooks/use-entity';
import { ProductAPI } from '../api/productApi';
import type { Product, ProductInsert, ProductUpdate } from '../api/productApi';

// Create singleton instance
const productAPI = new ProductAPI();

export function useProducts() {
  const entityHook = useEntity<Product, ProductInsert, ProductUpdate>(productAPI);
  
  // Rename 'data' to 'products' for consistency
  return {
    ...entityHook,
    products: entityHook.data
  };
}

export const useProductFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [priceFrom, setPriceFrom] = useState<number | null>(null);
  const [priceTo, setPriceTo] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setCategoryFilter(null);
    setSupplierFilter(null);
    setPriceFrom(null);
    setPriceTo(null);
    setSearchQuery('');
  };

  const getFilteredProducts = async (products: Product[]) => {
    let filtered = [...products];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(product => product.status === status);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply supplier filter
    if (supplierFilter) {
      filtered = filtered.filter(product => product.supplier_id === supplierFilter);
    }

    // Apply price filters
    if (priceFrom !== null) {
      filtered = filtered.filter(product => (product.price || 0) >= priceFrom);
    }
    if (priceTo !== null) {
      filtered = filtered.filter(product => (product.price || 0) <= priceTo);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.sku && product.sku.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      categoryFilter,
      supplierFilter,
      priceFrom,
      priceTo,
      searchQuery
    },
    setFilters: {
      setStatus,
      setCategoryFilter,
      setSupplierFilter,
      setPriceFrom,
      setPriceTo,
      setSearchQuery
    },
    clearFilters,
    getFilteredProducts
  };
};