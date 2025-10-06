import { BaseAPI, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Product = Tables['products'];
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

export class ProductAPI extends BaseAPI<Product, ProductInsert, ProductUpdate> {
  tableName = 'products';
  entityName = 'sản phẩm';

  // Override getAll to include supplier information
  async getAll(): Promise<Product[]> {
    try {

      const { data } = await supabase
        .from(this.tableName)
        .select(`*, supplier:suppliers(name)`)
        .order('created_at', { ascending: false });

      return (data || []) as unknown as Product[];
    } catch {
      // Supabase query failed
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include supplier information
  async getById(id: string): Promise<Product | null> {
    try {
      const { data } = await supabase
        .from(this.tableName)
        .select(`*, supplier:suppliers(*)`)
        .eq('id', id)
        .single();
      return data as unknown as Product;
    } catch {
      // Failed to get by ID
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Override create to handle default values
  async create(data: ProductInsert): Promise<Product> {
    try {
      const { data: result } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      return result as unknown as Product;
    } catch {
      // Failed to create
      throw new APIError(`Không thể tạo ${this.entityName} mới`);
    }
  }

  // Additional product-specific methods
  async getLowStock(minStock: number = 10): Promise<Product[]> {
    try {
      const allProducts = await this.getAll();
      return allProducts.filter(p => 
        p.status === 'active' && 
        (p.stock_quantity || 0) <= minStock
      );
    } catch {
      // Failed to get low stock products
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.search(query, ['name', 'sku', 'description']);
  }
}

// Export singleton instance
export const productApi = new ProductAPI();

// Export functions for backward compatibility
export const productImportApi = null;
