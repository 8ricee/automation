'use client';

import { useState, useEffect } from 'react';
import { ProductsAPI } from '@/lib/api-fallback';
import type { Product } from '@/lib/supabase-types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductsAPI.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await ProductsAPI.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo sản phẩm');
      throw err;
    }
  };

  const updateProduct = async (productData: Partial<Product> & { id: string }) => {
    try {
      const updatedProduct = await ProductsAPI.update(productData);
      setProducts(prev => 
        prev.map(product => product.id === productData.id ? updatedProduct : product)
      );
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật sản phẩm');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductsAPI.delete(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa sản phẩm');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct
  };
}

export const useProductFilters = () => null;
export const useProductSearch = () => null;