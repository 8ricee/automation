import { BaseAPI, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Employee = Tables['employees'];
export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeInsert>;

export class EmployeeAPI extends BaseAPI<Employee, EmployeeInsert, EmployeeUpdate> {
  tableName = 'employees';
  entityName = 'nhân viên';

  // Override create to handle default values
  async create(data: EmployeeInsert): Promise<Employee> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          password_hash: data.password_hash || 'default_password_hash'
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

  // Additional employee-specific methods
  async getByStatus(status: Employee['status']): Promise<Employee[]> {
    return this.getByField('status', status);
  }

  async getByDepartment(department: string): Promise<Employee[]> {
    return this.getByField('department', department);
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    return this.search(query, ['name', 'email', 'title']);
  }
}

// Export singleton instance
export const employeeApi = new EmployeeAPI();

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
        emp.position || '',
        emp.department || '',
        emp.status || '',
        emp.role_id || '',
        emp.hire_date
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
