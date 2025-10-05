'use client';

import { useEntity } from '@/hooks/use-entity';
import { CustomerAPI } from '../api/customerApi';
import type { Customer, CustomerInsert, CustomerUpdate } from '../api/customerApi';

// Create singleton instance
const customerAPI = new CustomerAPI();

export function useCustomers() {
  return useEntity<Customer, CustomerInsert, CustomerUpdate>(customerAPI);
}

// Placeholder for other hooks
export const useCustomerFilters = () => null;
