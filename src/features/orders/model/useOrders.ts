'use client';

import { useState, useEffect } from 'react';
import { orderApi, Order, OrderInsert, OrderUpdate } from '../api/orderApi';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: OrderInsert) => {
    try {
      const newOrder = await orderApi.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo đơn hàng');
      throw err;
    }
  };

  const updateOrder = async (id: string, updates: OrderUpdate) => {
    try {
      const updatedOrder = await orderApi.update(id, updates);
      setOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật đơn hàng');
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderApi.delete(id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa đơn hàng');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderApi.updateStatus(id, status);
      setOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái đơn hàng');
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    create: createOrder,
    update: updateOrder,
    delete: deleteOrder,
    updateStatus: updateOrderStatus
  };
};

export const useOrderFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setCustomerFilter(null);
    setDateFrom(null);
    setDateTo(null);
    setSearchQuery('');
  };

  const getFilteredOrders = async (orders: Order[]) => {
    let filtered = [...orders];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(order => order.status === status);
    }

    // Apply customer filter
    if (customerFilter) {
      filtered = filtered.filter(order => order.customer_id === customerFilter);
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(order => order.order_date && order.order_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(order => order.order_date && order.order_date <= dateTo);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        (order.notes && order.notes.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      customerFilter,
      dateFrom,
      dateTo,
      searchQuery
    },
    setFilters: {
      setStatus,
      setCustomerFilter,
      setDateFrom,
      setDateTo,
      setSearchQuery
    },
    clearFilters,
    getFilteredOrders
  };
};

export const useOrderStatistics = () => {
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thống kê đơn hàng');
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
