import { BaseAPI, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type PurchaseOrder = Tables['purchase_orders'];
export type PurchaseOrderInsert = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>;
export type PurchaseOrderUpdate = Partial<PurchaseOrderInsert>;

// Interface for purchase order statistics data
interface PurchaseOrderStatisticsItem {
  id: string;
  status: 'pending' | 'approved' | 'cancelled' | 'received' | null;
  total_amount: number | null;
}

// Interface for purchase order with join data
interface PurchaseOrderWithJoin {
  id: string;
  po_number: string | null;
  status: string | null;
  order_date: string | null;
  delivery_date: string | null;
  total_amount: number | null;
  notes: string | null;
  suppliers?: {
    name: string;
  } | null;
}

export class PurchasingAPI extends BaseAPI<PurchaseOrder, PurchaseOrderInsert, PurchaseOrderUpdate> {
  tableName = 'purchase_orders';
  entityName = 'đơn mua hàng';

  // Override getAll to include supplier information
  async getAll(): Promise<PurchaseOrder[]> {
    try {

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as PurchaseOrder[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include supplier and items information
  async getById(id: string): Promise<PurchaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
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

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as PurchaseOrder;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional purchasing-specific methods
  async getByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PurchaseOrder[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PurchaseOrder[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by supplier:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo nhà cung cấp`);
    }
  }

  async updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PurchaseOrder;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async searchPurchaseOrders(query: string): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .or(`po_number.ilike.%${query}%,notes.ilike.%${query}%,suppliers.name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PurchaseOrder[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  async getPendingOrders(): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PurchaseOrder[];
    } catch (error) {
      console.error(`Failed to get pending ${this.entityName}:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} đang chờ`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, status, total_amount');

      if (error) throw error;

      const stats = {
        total_orders: data.length,
        total_value: 0,
        pending_orders: 0,
        approved_orders: 0,
        received_orders: 0,
        cancelled_orders: 0
      };

      data.forEach((order: PurchaseOrderStatisticsItem) => {
        if (order.total_amount) {
          stats.total_value += order.total_amount;
        }

        switch (order.status) {
          case 'pending':
            stats.pending_orders++;
            break;
          case 'approved':
            stats.approved_orders++;
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
    } catch (error) {
      console.error('Error fetching purchasing statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const purchasingApi = new PurchasingAPI();

// Export functions for purchasing
export const purchasingExportApi = {
  async exportToCSV() {
    const orders = await purchasingApi.getAll();
    const headers = [
      'ID', 'Số đơn mua', 'Nhà cung cấp', 'Trạng thái', 
      'Ngày đặt hàng', 'Ngày giao hàng dự kiến', 'Tổng tiền', 'Ghi chú'
    ];
    
    const csvContent = [
      headers.join(','),
      ...orders.map((order: PurchaseOrderWithJoin) => [
        order.id,
        order.po_number,
        order.suppliers?.name || '',
        order.status || '',
        order.order_date,
        order.delivery_date || '',
        order.total_amount || 0,
        order.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
