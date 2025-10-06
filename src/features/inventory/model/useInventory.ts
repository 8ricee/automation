'use client';

import { useState, useEffect } from 'react';
import { inventoryApi, InventoryItem, InventoryUpdate } from '../api/inventoryApi';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getAll();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const updatedItem = await inventoryApi.updateStock(id, newStock);
      setInventory(prev => 
        prev.map(item => item.id === id ? { ...item, ...updatedItem } : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật tồn kho');
      throw err;
    }
  };

  const bulkUpdateInventory = async (updates: Array<{ id: string; updates: InventoryUpdate }>) => {
    try {
      const updatedItems = await inventoryApi.bulkUpdate(updates);
      const updatedMap = new Map(updatedItems.map(item => [item.id, item]));
      
      setInventory(prev => 
        prev.map(item => updatedMap.get(item.id) || item)
      );
      return updatedItems;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật hàng loạt');
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    updateStock,
    bulkUpdate: bulkUpdateInventory
  };
};

export const useInventoryFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setType(null);
    setLowStockOnly(false);
    setSearchQuery('');
  };

  const getFilteredInventory = async (inventory: InventoryItem[]) => {
    let filtered = [...inventory];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(item => item.category === type);
    }

    // Apply low stock filter
    if (lowStockOnly) {
      filtered = filtered.filter(item => item.low_stock_alert);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.sku && item.sku.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      type,
      lowStockOnly,
      searchQuery
    },
    setFilters: {
      setStatus,
      setType,
      setLowStockOnly,
      setSearchQuery
    },
    clearFilters,
    getFilteredInventory
  };
};

export const useInventoryStatistics = () => {
  const [statistics, setStatistics] = useState({
    total_items: 0,
    active_items: 0,
    inactive_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_stock_value: 0,
    total_cost_value: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thống kê tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};
