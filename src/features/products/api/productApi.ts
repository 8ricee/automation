// Sample API layer for products feature
import type { Product } from '@/data/types';

const ENDPOINTS = {
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: number) => `/api/products/${id}`,
};

export const productApi = {
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(ENDPOINTS.PRODUCTS);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductById(id: number): Promise<Product> {
    const response = await fetch(ENDPOINTS.PRODUCT_DETAIL(id));
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await fetch(ENDPOINTS.PRODUCTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const response = await fetch(ENDPOINTS.PRODUCT_DETAIL(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(ENDPOINTS.PRODUCT_DETAIL(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};

export const productImportApi = null;
