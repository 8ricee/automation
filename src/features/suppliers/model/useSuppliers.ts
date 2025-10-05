'use client';

import { useEntity, useFilters } from '@/hooks/use-entity';
import { SupplierAPI } from '../api/supplierApi';
import type { Supplier, SupplierInsert, SupplierUpdate } from '../api/supplierApi';

// Create singleton instance
const supplierAPI = new SupplierAPI();

export const useSuppliers = () => {
  return useEntity<Supplier, SupplierInsert, SupplierUpdate>(supplierAPI);
};

export const useSupplierFilters = () => {
  const filters = useFilters({
    status: null,
    city: null,
    state: null,
    searchQuery: ''
  });

  const getFilteredSuppliers = async (suppliers: Supplier[]) => {
    let filtered = [...suppliers];

    // Apply status filter
    if (filters.filters.status) {
      filtered = filtered.filter(supplier => supplier.status === filters.filters.status);
    }

    // Apply city filter
    if (filters.filters.city) {
      filtered = filtered.filter(supplier => supplier.city === filters.filters.city);
    }

    // Apply state filter
    if (filters.filters.state) {
      filtered = filtered.filter(supplier => supplier.state === filters.filters.state);
    }

    // Apply search query
    if (filters.filters.searchQuery) {
      const query = filters.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(query) ||
        (supplier.company && supplier.company.toLowerCase().includes(query)) ||
        (supplier.contact_person && supplier.contact_person.toLowerCase().includes(query)) ||
        (supplier.email && supplier.email.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    ...filters,
    getFilteredSuppliers
  };
};
