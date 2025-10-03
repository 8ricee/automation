import { supabase } from './supabase'
import { Employee } from './supabase-types'

export interface CreateEmployeeData {
  name: string
  email: string
  title?: string
  department?: string
  status?: 'active' | 'inactive' | 'terminated'
  role?: 'admin' | 'manager' | 'staff' | 'viewer'
  hourly_rate?: number
}

export interface UpdateEmployeeData {
  id: string
  name?: string
  email?: string
  title?: string
  department?: string
  status?: 'active' | 'inactive' | 'terminated'
  role?: 'admin' | 'manager' | 'staff' | 'viewer'
  hourly_rate?: number
}

export class EmployeesAPI {
  static async getAll(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
        console.error('Error fetching employee:', error)
        return null
    }
  }

  static async create(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  }

  static async update(updateData: UpdateEmployeeData): Promise<Employee> {
    try {
      const { id, ...updateValues } = updateData
      
      const { data, error } = await supabase
        .from('employees')
        .update(updateValues)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`name.ilike.%${query}%, email.ilike.%${query}%, title.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching employees:', error)
      throw error
    }
  }

  static async getByRole(role: 'admin' | 'manager' | 'staff' | 'viewer'): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching employees by role:', error)
      throw error
    }
  }

  static async getByDepartment(department: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching employees by department:', error)
      throw error
    }
  }
}
