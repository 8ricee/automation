import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Customer = Tables['customers'];
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type CustomerUpdate = Partial<CustomerInsert>;

export class CustomerAPI extends BaseAPI<Customer, CustomerInsert, CustomerUpdate> {
  tableName = 'customers';
  entityName = 'khách hàng';

  // Override create to handle default values
  async create(data: CustomerInsert): Promise<Customer> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          date_added: data.date_added || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Failed to create ${this.entityName}:`, error);
      throw new APIError(`Không thể tạo ${this.entityName}`);
    }
  }

  // Additional customer-specific methods
  async getActiveCustomers(): Promise<Customer[]> {
    return this.getByField('status', 'active');
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return this.search(query, ['name', 'email', 'company']);
  }
}

// Export singleton instance
export const customerApi = new CustomerAPI();

// Export functions for backward compatibility
export const customerExportApi = null;
