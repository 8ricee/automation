// Sample API layer for customers feature
import type { Customer } from '@/data/types';

// Mock API endpoints
const ENDPOINTS = {
  CUSTOMERS: '/api/customers',
  CUSTOMER_DETAIL: (id: number) => `/api/customers/${id}`,
};

export const customerApi = {
  // Get all customers
  async getAllCustomers(): Promise<Customer[]> {
    // Mock implementation
    const response = await fetch(ENDPOINTS.CUSTOMERS);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },

  // Get customer by ID
  async getCustomerById(id: number): Promise<Customer> {
    const response = await fetch(ENDPOINTS.CUSTOMER_DETAIL(id));
    if (!response.ok) throw new Error('Failed to fetch customer');
    return response.json();
  },

  // Create new customer
  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const response = await fetch(ENDPOINTS.CUSTOMERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },

  // Update customer
  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer> {
    const response = await fetch(ENDPOINTS.CUSTOMER_DETAIL(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },

  // Delete customer
  async deleteCustomer(id: number): Promise<void> {
    const response = await fetch(ENDPOINTS.CUSTOMER_DETAIL(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  },
};

// Placeholder for other API utilities
export const customerExportApi = null;
