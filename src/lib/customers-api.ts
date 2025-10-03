import { supabase } from './supabase'
import { Customer } from './supabase-types'

export interface CreateCustomerData {
  name: string
  email: string
  company?: string
  status?: 'active' | 'inactive' | 'pending'
  billing_address?: string
  shipping_address?: string
  tax_code?: string
  avatar_seed?: string
}

export interface UpdateCustomerData {
  id: string
  name?: string
  email?: string
  company?: string
  status?: string
}

export class CustomersAPI {
  static async getAll(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching customer:', error)
      return null
    }
  }

  static async create(customerData: CreateCustomerData): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  static async update(updateData: UpdateCustomerData): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updateData.name,
          email: updateData.email,
          company: updateData.company,
          status: updateData.status,
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%, email.ilike.%${query}%, company.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }

  static async getByStatus(status: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching customers by status:', error)
      throw error
    }
  }
}
