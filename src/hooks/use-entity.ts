'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseAPI, BaseEntity } from './base-api';

export interface UseEntityReturn<T extends BaseEntity, TInsert, TUpdate> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: TInsert) => Promise<T>;
  update: (id: string, updates: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<void>;
  getById: (id: string) => Promise<T | null>;
  search: (query: string, fields: string[]) => Promise<T[]>;
  getByField: (field: string, value: any) => Promise<T[]>;
}

export function useEntity<T extends BaseEntity, TInsert, TUpdate>(
  api: BaseAPI<T, TInsert, TUpdate>
): UseEntityReturn<T, TInsert, TUpdate> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (attempt: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Thêm timeout cho fetchData
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Data fetch timeout')), 15000)
      );
      
      const fetchPromise = api.getAll();
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi tải danh sách ${api.entityName}`;
      setError(errorMessage);
      
      // Retry logic với exponential backoff
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        // Retrying fetchData attempt
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchData(attempt + 1);
        }, delay);
      } else {
        // Failed to fetch after multiple attempts
      }
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createItem = useCallback(async (itemData: TInsert): Promise<T> => {
    try {
      const newItem = await api.create(itemData);
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi tạo ${api.entityName}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  const updateItem = useCallback(async (id: string, updates: TUpdate): Promise<T> => {
    try {
      const updatedItem = await api.update(id, updates);
      setData(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi cập nhật ${api.entityName}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi xóa ${api.entityName}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  const getItemById = useCallback(async (id: string): Promise<T | null> => {
    try {
      return await api.getById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi lấy thông tin ${api.entityName}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  const searchItems = useCallback(async (query: string, fields: string[]): Promise<T[]> => {
    try {
      return await api.search(query, fields);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi tìm kiếm ${api.entityName}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  const getItemsByField = useCallback(async (field: string, value: any): Promise<T[]> => {
    try {
      return await api.getByField(field, value);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Lỗi lấy ${api.entityName} theo ${field}`;
      setError(errorMessage);
      throw err;
    }
  }, [api]);

  useEffect(() => {
    // Chỉ fetch data một lần khi component mount
    fetchData();
  }, []); // Loại bỏ fetchData dependency để tránh vòng lặp

  // Thêm timeout tổng thể để tránh loading vô hạn
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        // Loading timeout
        setLoading(false);
        setError(`Timeout loading ${api.entityName}`);
      }
    }, 20000); // 20 giây timeout

    return () => clearTimeout(timer);
  }, [loading, api.entityName]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(),
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    getById: getItemById,
    search: searchItems,
    getByField: getItemsByField
  };
}

// Hook cho filters
export interface UseFiltersReturn {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  applyFilters: <T>(items: T[], filterFn: (item: T, filters: Record<string, any>) => boolean) => T[];
}

export function useFilters(initialFilters: Record<string, any> = {}): UseFiltersReturn {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const applyFilters = useCallback(<T>(
    items: T[], 
    filterFn: (item: T, filters: Record<string, any>) => boolean
  ): T[] => {
    return items.filter(item => filterFn(item, filters));
  }, []);

  return {
    filters,
    setFilter,
    clearFilters,
    applyFilters
  };
}
