'use client';

import { useState, useEffect } from 'react';
import { purchasingApi, PurchaseOrder, PurchaseOrderInsert, PurchaseOrderUpdate } from '../api/purchasingApi';

export const usePurchasing = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchasingApi.getAll();
      setPurchaseOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách đơn hàng mua');
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseOrder = async (poData: PurchaseOrderInsert) => {
    try {
      const newOrder = await purchasingApi.create(poData);
      setPurchaseOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo đơn hàng mua');
      throw err;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: PurchaseOrderUpdate) => {
    try {
      const updatedOrder = await purchasingApi.update(id, updates);
      setPurchaseOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật đơn hàng mua');
      throw err;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await purchasingApi.delete(id);
      setPurchaseOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa đơn hàng mua');
      throw err;
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    error,
    refetch: fetchPurchaseOrders,
    create: createPurchaseOrder,
    update: updatePurchaseOrder,
    delete: deletePurchaseOrder
  };
};

export const usePurchasingFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setSupplierFilter(null);
    setDateFrom(null);
    setDateTo(null);
    setOverdueOnly(false);
    setSearchQuery('');
  };

  const getFilteredPurchaseOrders = async (orders: PurchaseOrder[]) => {
    let filtered = [...orders];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(order => order.status === status);
    }

    // Apply supplier filter
    if (supplierFilter) {
      filtered = filtered.filter(order => order.supplier_id === supplierFilter);
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(order => order.order_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(order => order.order_date <= dateTo);
    }

    // Apply overdue filter
    if (overdueOnly) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(order => 
        order.delivery_date && order.delivery_date < today
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.po_number.toLowerCase().includes(query) ||
        (order.notes && order.notes.toLowerCase().includes(query)) ||
        (order as any).suppliers?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      supplierFilter,
      dateFrom,
      dateTo,
      overdueOnly,
      searchQuery
    },
    setFilters: {
      setStatus,
      setSupplierFilter,
      setDateFrom,
      setDateTo,
      setOverdueOnly,
      setSearchQuery
    },
    clearFilters,
    getFilteredPurchaseOrders
  };
};

export const usePurchasingStatistics = () => {
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_value: 0,
    draft_orders: 0,
    pending_orders: 0,
    approved_orders: 0,
    ordered_orders: 0,
    received_orders: 0,
    cancelled_orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchasingApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thống kê mua hàng');
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
