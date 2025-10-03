import { supabase } from './supabase'
import { Order } from './supabase-types'

export interface CreateOrderData {
  order_number: string
  customer_id: string
  quote_id?: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  order_date?: string
  required_delivery_date?: string
  subtotal?: number
  vat_rate?: number
  vat_amount?: number
  shipping_fee?: number
  total_amount?: number
  shipping_address?: string
  tracking_number?: string
  shipping_provider?: string
  notes?: string
}

export interface UpdateOrderData {
  id: string
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  required_delivery_date?: string
  subtotal?: number
  vat_rate?: number
  vat_amount?: number
  shipping_fee?: number
  total_amount?: number
  shipping_address?: string
  tracking_number?: string
  shipping_provider?: string
  notes?: string
}

export class OrdersAPI {
  static async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email, company),
          quote:quotes(quote_number)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          quote:quotes(*),
          order_items:order_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  static async create(orderData: CreateOrderData): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  static async update(updateData: UpdateOrderData): Promise<Order> {
    try {
      const { id, ...updateValues } = updateData
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateValues)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .or(`order_number.ilike.%${query}%, shipping_provider.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching orders:', error)
      throw error
    }
  }

  static async getByStatus(status: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }
  }

  static async getByCustomer(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, email, company)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching orders by customer:', error)
      throw error
    }
  }
}
