'use client';

import * as React from "react";
import { GenericSearch } from "@/components/ui/generic-search";
import { SupplierAPI } from "@/features/suppliers/api/supplierApi";
import type { Supplier } from "@/features/suppliers/api/supplierApi";

interface SupplierSearchProps {
  value?: string;
  onValueChange: (supplier: Supplier | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
}

// Create a singleton instance of SupplierAPI
const supplierApi = new SupplierAPI();

// Helper function to create a search function for GenericSearch
const createSupplierSearchFunction = (api: SupplierAPI) => async (query: string) => {
  return api.searchSuppliers(query);
};

export function SupplierSearch({
  value,
  onValueChange,
  placeholder = "Tìm kiếm nhà cung cấp...",
  className,
  disabled = false,
  maxDisplayLength = 30,
}: SupplierSearchProps) {
  return (
    <GenericSearch<Supplier>
      value={value}
      onValueChange={onValueChange}
      searchFunction={createSupplierSearchFunction(supplierApi)}
      displayField="name"
      searchFields={['name', 'email', 'contact_person']}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      maxDisplayLength={maxDisplayLength}
    />
  );
}
