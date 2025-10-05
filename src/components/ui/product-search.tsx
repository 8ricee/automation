'use client';

import React from 'react';
import { GenericSearch, createSearchFunction } from './generic-search';
import { ProductAPI } from '@/features/products/api/productApi';
import type { Product } from '@/features/products/api/productApi';

interface ProductSearchProps {
  value?: string;
  onValueChange: (product: Product | null) => void;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
}

// Create singleton instance
const productAPI = new ProductAPI();

export function ProductSearch({
  value,
  onValueChange,
  className,
  disabled = false,
  maxDisplayLength = 30
}: ProductSearchProps) {
  const searchFunction = createSearchFunction(productAPI, ['name', 'sku', 'description']);

  return (
    <GenericSearch
      value={value}
      onValueChange={onValueChange}
      searchFunction={searchFunction}
      displayField="name"
      searchFields={['name', 'sku', 'description']}
      placeholder="Tìm kiếm sản phẩm..."
      className={className}
      disabled={disabled}
      maxDisplayLength={maxDisplayLength}
      emptyMessage="Không tìm thấy sản phẩm"
      loadingMessage="Đang tải sản phẩm..."
    />
  );
}