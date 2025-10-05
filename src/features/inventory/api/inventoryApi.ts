import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type InventoryItem = Tables['products'] & {
  supplier_name?: string;
  low_stock_alert?: boolean;
};

export type InventoryUpdate = Partial<Pick<InventoryItem, 'stock_quantity' | 'status' | 'price' | 'cost'>>;

export class InventoryAPI extends BaseAPI<InventoryItem, Tables['products'], InventoryUpdate> {
  tableName = 'products';
  entityName = 'kho hàng';

  // Override getAll to include supplier information and add computed fields
  async getAll(): Promise<InventoryItem[]> {
    try {

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      
      // Add supplier name and low stock alert
      return (data || []).map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock_quantity || 0) <= 10
      })) as unknown as InventoryItem[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include supplier information
  async getById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return {
        ...(data as any),
        supplier_name: (data as any).suppliers?.name,
        low_stock_alert: ((data as any).stock_quantity || 0) <= 10
      } as unknown as InventoryItem;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional inventory-specific methods
  async getLowStockItems(minStock: number = 10): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .lte('stock_quantity', minStock)
        .eq('status', 'active')
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: true
      })) as unknown as InventoryItem[];
    } catch (error) {
      console.error(`Failed to get low stock items:`, error);
      throw new APIError(`Không thể lấy sản phẩm tồn kho thấp`);
    }
  }

  async getOutOfStockItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('stock_quantity', 0)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: true
      })) as unknown as InventoryItem[];
    } catch (error) {
      console.error(`Failed to get out of stock items:`, error);
      throw new APIError(`Không thể lấy sản phẩm hết hàng`);
    }
  }

  async updateStock(id: string, newStock: number): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ stock_quantity: newStock })
        .eq('id', id)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .single();

      if (error) throw error;
      
      return {
        ...(data as any),
        supplier_name: (data as any).suppliers?.name,
        low_stock_alert: ((data as any).stock_quantity || 0) <= 10
      } as unknown as InventoryItem;
    } catch (error) {
      console.error(`Failed to update stock:`, error);
      throw new APIError(`Không thể cập nhật tồn kho`);
    }
  }

  async adjustStock(id: string, adjustment: number, reason?: string): Promise<InventoryItem> {
    try {
      // Get current stock
      const currentItem = await this.getById(id);
      if (!currentItem) {
        throw new APIError(`Không tìm thấy sản phẩm`);
      }

      const newStock = (currentItem.stock_quantity || 0) + adjustment;
      if (newStock < 0) {
        throw new APIError(`Tồn kho không thể âm`);
      }

      return await this.updateStock(id, newStock);
    } catch (error) {
      console.error(`Failed to adjust stock:`, error);
      throw error;
    }
  }

  async getBySupplier(supplierId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('supplier_id', supplierId)
        .order('name');

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock_quantity || 0) <= 10
      })) as unknown as InventoryItem[];
    } catch (error) {
      console.error(`Failed to get items by supplier:`, error);
      throw new APIError(`Không thể lấy sản phẩm theo nhà cung cấp`);
    }
  }

  async searchInventory(query: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock_quantity || 0) <= 10
      })) as unknown as InventoryItem[];
    } catch (error) {
      console.error(`Failed to search inventory:`, error);
      throw new APIError(`Không thể tìm kiếm kho hàng`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, stock, price, cost, status');

      if (error) throw error;

      const stats = {
        total_items: data.length,
        active_items: 0,
        inactive_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        total_stock_value: 0,
        total_cost_value: 0
      };

      data.forEach((item: any) => {
        if (item.status === 'active') {
          stats.active_items++;
        } else {
          stats.inactive_items++;
        }

        if ((item.stock_quantity || 0) <= 10) {
          stats.low_stock_items++;
        }

        if ((item.stock_quantity || 0) === 0) {
          stats.out_of_stock_items++;
        }

        if (item.price && item.stock_quantity) {
          stats.total_stock_value += item.price * item.stock_quantity;
        }

        if (item.cost && item.stock_quantity) {
          stats.total_cost_value += item.cost * item.stock_quantity;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const inventoryApi = new InventoryAPI();

// Export functions for inventory
export const inventoryExportApi = {
  async exportToCSV() {
    const items = await inventoryApi.getAll();
    const headers = [
      'ID', 'Tên sản phẩm', 'SKU', 'Nhà cung cấp', 'Tồn kho', 
      'Giá bán', 'Giá nhập', 'Trạng thái', 'Cảnh báo tồn kho thấp'
    ];
    
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.id,
        item.name,
        item.sku || '',
        item.supplier_name || '',
        item.stock_quantity || 0,
        item.price || 0,
        item.cost || 0,
        item.status || '',
        item.low_stock_alert ? 'Có' : 'Không'
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
