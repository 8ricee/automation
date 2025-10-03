import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase-types';

export type Employee = Tables['employees'];
export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeInsert>;

// API functions for employees
export const employeeApi = {
  // Get all employees
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get employee by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new employee
  async create(employee: EmployeeInsert) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update employee
  async update(id: string, updates: EmployeeUpdate) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete employee
  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get employees by status
  async getByStatus(status: Employee['status']) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', status)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Get employees by department
  async getByDepartment(department: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('department', department)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Search employees
  async search(query: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,title.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data;
  }
};

// Export functions for employees
export const employeeExportApi = {
  async exportToCSV() {
    const employees = await employeeApi.getAll();
    const headers = ['ID', 'Tên', 'Email', 'Chức vụ', 'Phòng ban', 'Trạng thái', 'Vai trò', 'Ngày tuyển dụng'];
    
    const csvContent = [
      headers.join(','),
      ...employees.map(emp => [
        emp.id,
        emp.name,
        emp.email,
        emp.title || '',
        emp.department || '',
        emp.status || '',
        emp.role,
        emp.hire_date
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
