// API wrapper that uses Supabase directly
import { Product, Customer, Employee, Order, Quote, Project } from './supabase-types';

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic function to handle Supabase queries
async function executeQuery<T>(
  supabaseQuery: () => Promise<T[]>,
  entityName: string
): Promise<T[]> {
  try {
    console.log(`Fetching ${entityName} from Supabase...`);
    const result = await supabaseQuery();
    console.log(`Successfully fetched ${entityName} from Supabase`);
    return result;
  } catch (error) {
    console.error(`Supabase query failed for ${entityName}:`, error);
    throw new APIError(`Không thể tải dữ liệu ${entityName}`);
  }
}

// Products API
export class ProductsAPI {
  static async getAll(): Promise<Product[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('products')
          .select(`*, supplier:suppliers(name)`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
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
      console.error('Failed to get product by ID:', error);
      throw new APIError('Không thể tải thông tin sản phẩm');
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

// Customers API
export class CustomersAPI {
  static async getAll(): Promise<Customer[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
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
      console.error('Failed to get customer by ID:', error);
      throw new APIError('Không thể tải thông tin khách hàng');
    }
  }

  static async create(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          date_added: customerData.date_added || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw new APIError('Không thể tạo khách hàng');
    }
  }

  static async update(customerData: Partial<Customer> & { id: string }): Promise<Customer> {
    try {
      const { supabase } = await import('./supabase');
      const { id, ...updateData } = customerData;
      
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw new APIError('Không thể cập nhật khách hàng');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw new APIError('Không thể xóa khách hàng');
    }
  }
}

// Employees API
export class EmployeesAPI {
  static async getAll(): Promise<Employee[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'employees'
    );
  }

  static async getById(id: string): Promise<Employee | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Failed to get employee by ID:', error);
      throw new APIError('Không thể tải thông tin nhân viên');
    }
  }

  static async create(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          password_hash: employeeData.password_hash || 'default_password_hash'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw new APIError('Không thể tạo nhân viên');
    }
  }

  static async update(employeeData: Partial<Employee> & { id: string }): Promise<Employee> {
    try {
      const { supabase } = await import('./supabase');
      const { id, ...updateData } = employeeData;
      
      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw new APIError('Không thể cập nhật nhân viên');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw new APIError('Không thể xóa nhân viên');
    }
  }
}

// Orders API
export class OrdersAPI {
  static async getAll(): Promise<Order[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'orders'
    );
  }
}

// Quotes API
export class QuotesAPI {
  static async getAll(): Promise<Quote[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'quotes'
    );
  }
};

// Projects API
export class ProjectsAPI {
  static async getAll(): Promise<Project[]> {
    return executeQuery(
      async () => {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            customers (
              name, email, company
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'projects'
    );
  }

  static async getById(id: string): Promise<Project | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Failed to get project by ID:', error);
      throw new APIError('Không thể tải thông tin dự án');
    }
  }

  static async create(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          status: projectData.status || 'planning',
          budget: projectData.budget || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new APIError('Không thể tạo dự án mới');
    }
  }

  static async update(projectData: Partial<Project> & { id: string }): Promise<Project> {
    try {
      const { supabase } = await import('./supabase');
      const { id, ...updateData } = projectData;
      
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw new APIError('Không thể cập nhật dự án');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new APIError('Không thể xóa dự án');
    }
  }

  static async getStatistics() {
    try {
      const data = await this.getAll();
      return {
        total_projects: data.length,
        completed_projects: data.filter(p => p.status === 'completed').length,
        in_progress_projects: data.filter(p => p.status === 'in_progress').length,
        planning_projects: data.filter(p => p.status === 'planning').length,
        cancelled_projects: data.filter(p => p.status === 'cancelled').length,
        total_budget: data.reduce((sum, p) => sum + (p.budget || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      throw error;
    }
  }
}
