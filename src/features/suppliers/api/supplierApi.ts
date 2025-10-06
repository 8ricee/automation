import { BaseAPI, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Supplier = Tables['suppliers'];
export type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
export type SupplierUpdate = Partial<SupplierInsert>;

export class SupplierAPI extends BaseAPI<Supplier, SupplierInsert, SupplierUpdate> {
  tableName = 'suppliers';
  entityName = 'nhà cung cấp';

  // Override create to handle default values
  async create(data: SupplierInsert): Promise<Supplier> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          status: data.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return result as unknown as Supplier;
    } catch (error) {
      console.error(`Failed to create ${this.entityName}:`, error);
      throw new APIError(`Không thể tạo ${this.entityName} mới`);
    }
  }

  // Additional supplier-specific methods
  async getByStatus(status: Supplier['status']): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as Supplier[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    return this.getByStatus('active');
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as Supplier[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  async getSuppliersByLocation(city?: string, state?: string): Promise<Supplier[]> {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (city) {
        query = query.eq('city', city);
      }
      if (state) {
        query = query.eq('state', state);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return (data || []) as unknown as Supplier[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by location:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo địa điểm`);
    }
  }

  async updateStatus(id: string, status: Supplier['status']): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Supplier;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, status, city, state');

      if (error) throw error;

      const stats = {
        total_suppliers: data.length,
        active_suppliers: 0,
        inactive_suppliers: 0,
        suppliers_by_city: {} as Record<string, number>,
        suppliers_by_state: {} as Record<string, number>
      };

      data.forEach((supplier: { status: string; city?: string; state?: string }) => {
        switch (supplier.status) {
          case 'active':
            stats.active_suppliers++;
            break;
          case 'inactive':
            stats.inactive_suppliers++;
            break;
        }

        if (supplier.city) {
          stats.suppliers_by_city[supplier.city] = (stats.suppliers_by_city[supplier.city] || 0) + 1;
        }

        if (supplier.state) {
          stats.suppliers_by_state[supplier.state] = (stats.suppliers_by_state[supplier.state] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supplierApi = new SupplierAPI();

// Export functions for suppliers
export const supplierExportApi = {
  async exportToCSV() {
    const suppliers = await supplierApi.getAll();
    const headers = [
      'ID', 'Tên', 'Công ty', 'Email', 'Số điện thoại', 'Người liên hệ', 
      'Thành phố', 'Tỉnh/Thành', 'Trạng thái', 'Ghi chú'
    ];
    
    const csvContent = [
      headers.join(','),
      ...suppliers.map(supplier => [
        supplier.id,
        supplier.name,
        supplier.company || '',
        supplier.email || '',
        supplier.phone || '',
        supplier.contact_person || '',
        supplier.city || '',
        supplier.state || '',
        supplier.status || '',
        supplier.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
