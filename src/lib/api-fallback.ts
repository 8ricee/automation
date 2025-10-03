// Fallback API wrapper that uses mock data when Supabase is not available
import { Product, Customer, Employee, Order, Quote } from './supabase-types';
import { mockProducts, mockCustomers, mockEmployees, mockOrders, mockQuotes } from './mock-data';

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic function to handle Supabase queries with fallback to mock data
async function withFallback<T>(
  supabaseQuery: () => Promise<T[]>,
  mockData: T[],
  entityName: string
): Promise<T[]> {
  try {
    console.log(`Fetching ${entityName} from Supabase...`);
    const result = await supabaseQuery();
    console.log(`Successfully fetched ${entityName} from Supabase`);
    return result;
  } catch (error) {
    console.warn(`Supabase query failed for ${entityName}, using mock data:`, error);
    return mockData;
  }
}

// Products API with fallback
export class ProductsAPI {
  static async getAll(): Promise<Product[]> {
    return withFallback(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('products')
          .select(`*, supplier:suppliers(name)`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      mockProducts,
      'products'
    );
  }

  static async getById(id: string): Promise<Product | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('products')
        .select(`*, supplier:suppliers(*)`)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.warn('Supabase query failed, searching in mock data:', error);
      return mockProducts.find(p => p.id === id) || null;
    }
  }

  static async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          price: productData.price,
          cost: productData.cost || 0,
          sku: productData.sku || '',
          stock: productData.stock || 0,
          status: productData.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new APIError('Không thể tạo sản phẩm mới');
    }
  }

  static async update(productData: Partial<Product> & { id: string }): Promise<Product> {
    try {
      const { supabase } = await import('./supabase');
      const { id, ...updateData } = productData;
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new APIError('Không thể cập nhật sản phẩm');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw new APIError('Không thể xóa sản phẩm');
    }
  }

  static async getLowStock(minStock: number = 10): Promise<Product[]> {
    try {
      const allProducts = await this.getAll();
      return allProducts.filter(p => 
        p.status === 'active' && 
        (p.stock || 0) <= minStock
      );
    } catch (error) {
      console.error('Failed to get low stock products:', error);
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAll();
      const searchQuery = query.toLowerCase();
      return allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery)) ||
        (p.description && p.description.toLowerCase().includes(searchQuery))
      );
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  }
}

// Customers API with fallback
export class CustomersAPI {
  static async getAll(): Promise<Customer[]> {
    return withFallback(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      mockCustomers,
      'customers'
    );
  }

  static async getById(id: string): Promise<Customer | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.warn('Supabase query failed, searching in mock data:', error);
      return mockCustomers.find(c => c.id === id) || null;
    }
  }
}

// Employees API with fallback
export class EmployeesAPI {
  static async getAll(): Promise<Employee[]> {
    return withFallback(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      mockEmployees,
      'employees'
    );
  }
}

// Orders API with fallback
export class OrdersAPI {
  static async getAll(): Promise<Order[]> {
    return withFallback(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      mockOrders,
      'orders'
    );
  }
}

// Quotes API with fallback
export class QuotesAPI {
  static async getAll(): Promise<Quote[]> {
    return withFallback(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      mockQuotes,
      'quotes'
    );
  }
}
