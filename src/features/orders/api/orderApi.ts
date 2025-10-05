import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Order = Tables['orders'];
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type OrderUpdate = Partial<OrderInsert>;

export class OrderAPI extends BaseAPI<Order, OrderInsert, OrderUpdate> {
  tableName = 'orders';
  entityName = 'đơn hàng';

  // Override getAll to include customer information
  async getAll(): Promise<Order[]> {
    try {
      console.log(`Fetching ${this.entityName} from Supabase...`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`Successfully fetched ${this.entityName} from Supabase`);
      return (data || []) as unknown as Order[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include customer and items information
  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
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

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as Order;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional order-specific methods
  async getByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Order[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getByCustomer(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Order[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by customer:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo khách hàng`);
    }
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Order;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async searchOrders(query: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%,customers.name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Order[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
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
        total_revenue: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0
      };

      data.forEach((order: any) => {
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
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderApi = new OrderAPI();

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
        (order as any).customers?.name || '',
        order.status || '',
        order.order_date,
        order.total_amount || 0,
        order.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};