import { supabase } from '@/lib/supabase';
import { PurchaseOrder, PurchaseOrderInsert, PurchaseOrderUpdate } from '@/lib/purchasing-api';

// API functions for purchasing
export const purchasingApi = {
  // Get all purchase orders
  async getAll() {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person, email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get purchase order by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person, email
        ),
        purchaseorder_items (
          *,
          products (
            name, sku
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new purchase order
  async create(purchaseOrder: PurchaseOrderInsert) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .insert([purchaseOrder])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update purchase order
  async update(id: string, updates: PurchaseOrderUpdate) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete purchase order
  async delete(id: string) {
    const { error } = await supabase
      .from('purchaseorders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get purchase orders by status
  async getByStatus(status: PurchaseOrder['status']) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get purchase orders by supplier
  async getBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person
        )
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get overdue purchase orders
  async getOverdueOrders() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person
        )
      `)
      .lt('expected_delivery_date', today)
      .in('status', ['ordered', 'pending'])
      .order('expected_delivery_date');
    
    if (error) throw error;
    return data;
  },

  // Search purchase orders
  async search(query: string) {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select(`
        *,
        suppliers (
          name, contact_person
        )
      `)
      .or(`po_number.ilike.%${query}%,notes.ilike.%${query}%,suppliers.name.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get purchasing statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('purchaseorders')
      .select('id, status, total_amount, order_date');
    
    if (error) throw error;
    
    const stats = {
      total_orders: data.length,
      total_value: 0,
      draft_orders: 0,
      pending_orders: 0,
      approved_orders: 0,
      ordered_orders: 0,
      received_orders: 0,
      cancelled_orders: 0
    };
    
    data.forEach(order => {
      if (order.total_amount) {
        stats.total_value += order.total_amount;
      }
      
      switch (order.status) {
        case 'draft':
          stats.draft_orders++;
          break;
        case 'pending':
          stats.pending_orders++;
          break;
        case 'approved':
          stats.approved_orders++;
          break;
        case 'ordered':
          stats.ordered_orders++;
          break;
        case 'received':
          stats.received_orders++;
          break;
        case 'cancelled':
          stats.cancelled_orders++;
          break;
      }
    });
    
    return stats;
  }
};

// Export functions for purchasing
export const purchasingExportApi = {
  async exportToCSV() {
    const orders = await purchasingApi.getAll();
    const headers = [
      'ID', 'Số PO', 'Nhà cung cấp', 'Trạng thái', 
      'Ngày đặt hàng', 'Ngày giao hàng dự kiến', 'Tổng tiền', 'Ghi chú'
    ];
    
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        order.po_number,
        order.suppliers?.name || '',
        order.status || '',
        order.order_date,
        order.expected_delivery_date || '',
        order.total_amount || 0,
        order.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
