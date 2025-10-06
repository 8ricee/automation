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

// Utility function để tạo timeout promise (unused but kept for future use)
// const createTimeoutPromise = (timeoutMs: number) => 
//   new Promise((_, reject) => 
//     setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
//   );

// Utility function để retry API calls với exponential backoff
const retryApiCall = async <T>(
  apiCall: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      console.warn(`API call attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

export abstract class BaseAPI<T extends BaseEntity, TInsert, TUpdate> {
  abstract tableName: string;
  abstract entityName: string;

  // Generic CRUD operations với timeout và retry
  async getAll(): Promise<T[]> {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as T[];
      };

      return await retryApiCall(apiCall);
    } catch {
      // Supabase query failed
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const apiCall = async () => {
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
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  async create(data: TInsert): Promise<T> {
    try {
      const apiCall = async () => {
        const { data: result, error } = await supabase
          .from(this.tableName)
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result as unknown as T;
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to create ${this.entityName}:`, error);
      throw new APIError(`Không thể tạo ${this.entityName} mới`);
    }
  }

  async update(id: string, updates: TUpdate): Promise<T> {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as unknown as T;
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to update ${this.entityName}:`, error);
      throw new APIError(`Không thể cập nhật ${this.entityName}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const apiCall = async () => {
        const { error } = await supabase
          .from(this.tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
      };

      await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to delete ${this.entityName}:`, error);
      throw new APIError(`Không thể xóa ${this.entityName}`);
    }
  }

  // Generic search method với timeout và retry
  async search(query: string, fields: string[]): Promise<T[]> {
    try {
      const apiCall = async () => {
        if (!query.trim()) {
          // Nếu query rỗng, trả về tất cả
          return this.getAll();
        }

        const searchConditions = fields.map(field => `${field}.ilike.%${query}%`).join(',');
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .or(searchConditions)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as T[];
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  // Generic filter by field với timeout và retry
  async getByField(field: string, value: unknown): Promise<T[]> {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq(field, value)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as T[];
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ${field}:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo ${field}`);
    }
  }

  // Batch operations
  async createMany(items: TInsert[]): Promise<T[]> {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(items)
          .select();

        if (error) throw error;
        return (data || []) as unknown as T[];
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to create multiple ${this.entityName}:`, error);
      throw new APIError(`Không thể tạo nhiều ${this.entityName}`);
    }
  }

  async updateMany(updates: Array<{ id: string; data: TUpdate }>): Promise<T[]> {
    try {
      const results: T[] = [];
      
      // Process updates in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(({ id, data }) => this.update(id, data));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return results;
    } catch (error) {
      console.error(`Failed to update multiple ${this.entityName}:`, error);
      throw new APIError(`Không thể cập nhật nhiều ${this.entityName}`);
    }
  }

  // Count operations
  async count(): Promise<number> {
    try {
      const apiCall = async () => {
        const { count, error } = await supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to count ${this.entityName}:`, error);
      throw new APIError(`Không thể đếm ${this.entityName}`);
    }
  }

  async countByField(field: string, value: unknown): Promise<number> {
    try {
      const apiCall = async () => {
        const { count, error } = await supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .eq(field, value);

        if (error) throw error;
        return count || 0;
      };

      return await retryApiCall(apiCall);
    } catch (error) {
      console.error(`Failed to count ${this.entityName} by ${field}:`, error);
      throw new APIError(`Không thể đếm ${this.entityName} theo ${field}`);
    }
  }
}
