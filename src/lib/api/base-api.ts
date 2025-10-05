import { supabase } from '@/utils/supabase';

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export interface BaseEntity {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export abstract class BaseAPI<T extends BaseEntity, TInsert, TUpdate> {
  abstract tableName: string;
  abstract entityName: string;

  // Generic CRUD operations
  async getAll(): Promise<T[]> {
    try {
      console.log(`Fetching ${this.entityName} from Supabase...`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`Successfully fetched ${this.entityName} from Supabase`);
      return (data || []) as unknown as T[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as T;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  async create(data: TInsert): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as unknown as T;
    } catch (error) {
      console.error(`Failed to create ${this.entityName}:`, error);
      throw new APIError(`Không thể tạo ${this.entityName} mới`);
    }
  }

  async update(id: string, updates: TUpdate): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as T;
    } catch (error) {
      console.error(`Failed to update ${this.entityName}:`, error);
      throw new APIError(`Không thể cập nhật ${this.entityName}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Failed to delete ${this.entityName}:`, error);
      throw new APIError(`Không thể xóa ${this.entityName}`);
    }
  }

  // Generic search method
  async search(query: string, fields: string[]): Promise<T[]> {
    try {
      const searchConditions = fields.map(field => `${field}.ilike.%${query}%`).join(',');
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(searchConditions)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as T[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  // Generic filter by field
  async getByField(field: string, value: any): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq(field, value)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as T[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ${field}:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo ${field}`);
    }
  }
}
