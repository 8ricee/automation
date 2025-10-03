import { supabase } from './supabase'
import { Quote } from './supabase-types'

export interface CreateQuoteData {
  quote_number: string
  customer_id: string
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  issue_date?: string
  expiry_date?: string
  valid_for_days?: number
  subtotal?: number
  vat_rate?: number
  vat_amount?: number
  shipping_fee?: number
  total_amount?: number
  notes?: string
}

export interface UpdateQuoteData {
  id: string
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  expiry_date?: string
  valid_for_days?: number
  subtotal?: number
  vat_rate?: number
  vat_amount?: number
  shipping_fee?: number
  total_amount?: number
  notes?: string
}

export class QuotesAPI {
  static async getAll(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching quotes:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Quote | null> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*),
          quote_items:quote_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching quote:', error)
      return null
    }
  }

  static async create(quoteData: CreateQuoteData): Promise<Quote> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating quote:', error)
      throw error
    }
  }

  static async update(updateData: UpdateQuoteData): Promise<Quote> {
    try {
      const { id, ...updateValues } = updateData
      
      const { data, error } = await supabase
        .from('quotes')
        .update(updateValues)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating quote:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting quote:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .or(`quote_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching quotes:', error)
      throw error
    }
  }

  static async getByStatus(status: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching quotes by status:', error)
      throw error
    }
  }

  static async getByCustomer(customerId: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching quotes by customer:', error)
      throw error
    }
  }

  static async getExpired(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .lt('expiry_date', new Date().toISOString().split('T')[0])
        .neq('status', 'expired')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching expired quotes:', error)
      throw error
    }
  }
}
