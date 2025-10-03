import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase-types';

export type Order = Tables['orders'];
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type OrderUpdate = Partial<OrderInsert>;

// API functions for orders
export const orderApi = {
  // Get all orders
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get order by ID with items
  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name, email, company
        ),
        order_items (
          *,
          products (
            name, sku, price
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new order
  async create(order: OrderInsert) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update order
  async update(id: string, updates: OrderUpdate) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete order
  async delete(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get orders by status
  async getByStatus(status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get orders by customer
  async getByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update order status
  async updateStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search orders
  async search(query: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%,customers.name.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get order statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount');
    
    if (error) throw error;
    
    const stats = {
      total_orders: data.length,
      total_revenue: 0,
      pending_orders: 0,
      processing_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      cancelled_orders: 0
    };
    
    data.forEach(order => {
      if (order.total_amount) {
        stats.total_revenue += order.total_amount;
      }
      
      switch (order.status) {
        case 'pending':
          stats.pending_orders++;
          break;
        case 'confirmed':
          stats.processing_orders++;
          break;
        case 'shipped':
          stats.shipped_orders++;
          break;
        case 'delivered':
          stats.delivered_orders++;
          break;
        case 'cancelled':
          stats.cancelled_orders++;
          break;
      }
    });
    
    return stats;
  }
};

// Export functions for orders
export const orderExportApi = {
  async exportToCSV() {
    const orders = await orderApi.getAll();
    const headers = [
      'ID', 'Số đơn hàng', 'Khách hàng', 'Trạng thái', 
      'Ngày đặt hàng', 'Tổng tiền', 'Ghi chú'
    ];
    
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        order.order_number,
        order.customers?.name || '',
        order.status || '',
        order.order_date,
        order.total_amount || 0,
        order.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
