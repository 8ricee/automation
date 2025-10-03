import { supabase } from './supabase'
import { Supplier } from './supabase-types'

export interface CreateSupplierData {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_code?: string
}

export interface UpdateSupplierData {
  id: string
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_code?: string
}

export class SuppliersAPI {
  static async getAll(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching supplier:', error)
      return null
    }
  }

  static async create(supplierData: CreateSupplierData): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  }

  static async update(updateData: UpdateSupplierData): Promise<Supplier> {
    try {
      const { id, ...updateValues } = updateData
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updateValues)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating supplier:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting supplier:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .or(`name.ilike.%${query}%, contact_person.ilike.%${query}%, email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching suppliers:', error)
      throw error
    }
  }
}