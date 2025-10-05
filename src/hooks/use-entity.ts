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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi tải danh sách ${api.entityName}`);
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
      setError(err instanceof Error ? err.message : `Lỗi tạo ${api.entityName}`);
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
      setError(err instanceof Error ? err.message : `Lỗi cập nhật ${api.entityName}`);
      throw err;
    }
  }, [api]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi xóa ${api.entityName}`);
      throw err;
    }
  }, [api]);

  const getItemById = useCallback(async (id: string): Promise<T | null> => {
    try {
      return await api.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi lấy thông tin ${api.entityName}`);
      throw err;
    }
  }, [api]);

  const searchItems = useCallback(async (query: string, fields: string[]): Promise<T[]> => {
    try {
      return await api.search(query, fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi tìm kiếm ${api.entityName}`);
      throw err;
    }
  }, [api]);

  const getItemsByField = useCallback(async (field: string, value: any): Promise<T[]> => {
    try {
      return await api.getByField(field, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi lấy ${api.entityName} theo ${field}`);
      throw err;
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
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
