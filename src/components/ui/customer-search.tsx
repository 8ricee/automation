'use client';

import React from 'react';
import { GenericSearch, createSearchFunction } from './generic-search';
import { CustomerAPI } from '@/features/customers/api/customerApi';
import type { Customer } from '@/features/customers/api/customerApi';

interface CustomerSearchProps {
  value?: string;
  onValueChange: (customer: Customer | null) => void;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
}

// Create singleton instance
const customerAPI = new CustomerAPI();

export function CustomerSearch({
  value,
  onValueChange,
  className,
  disabled = false,
  maxDisplayLength = 30
}: CustomerSearchProps) {
  const searchFunction = createSearchFunction(customerAPI, ['name', 'email', 'company']);

  return (
    <GenericSearch
      value={value}
      onValueChange={onValueChange}
      searchFunction={searchFunction}
      displayField="name"
      searchFields={['name', 'email', 'company']}
      placeholder="Tìm kiếm khách hàng..."
      className={className}
      disabled={disabled}
      maxDisplayLength={maxDisplayLength}
      emptyMessage="Không tìm thấy khách hàng"
      loadingMessage="Đang tải khách hàng..."
    />
  );
}
