import { supabase } from './supabase'
import { Product } from './supabase-types'

export interface InventoryItem extends Product {
  supplier_name?: string;
  low_stock_alert?: boolean;
}

export interface InventoryUpdate {
  stock?: number;
  price?: number;
  cost?: number;
  status?: 'active' | 'inactive' | 'discontinued';
}

export class InventoryAPI {
  static async getAll(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add supplier name and low stock alert
      return data.map(item => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock || 0) <= 10
      }))
    } catch (error) {
      console.error('Error fetching inventory:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return {
        ...data,
        supplier_name: data.suppliers?.name,
        low_stock_alert: (data.stock || 0) <= 10
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      throw error
    }
  }

  static async updateStock(id: string, newStock: number): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }

  static async bulkUpdate(updates: Array<{ id: string; updates: InventoryUpdate }>): Promise<Product[]> {
    try {
      const promises = updates.map(({ id, updates }) =>
        supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      )
      
      const results = await Promise.all(promises)
      
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw errors[0].error
      }
      
      return results.map(result => result.data)
    } catch (error) {
      console.error('Error bulk updating inventory:', error)
      throw error
    }
  }

  static async getLowStockItems(threshold: number = 10): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .lte('stock', threshold)
        .eq('status', 'active')
        .order('stock')

      if (error) throw error

      return data.map(item => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: true
      }))
    } catch (error) {
      console.error('Error fetching low stock items:', error)
      throw error
    }
  }

  static async getByStatus(status: Product['status']): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('status', status)
        .order('name')

      if (error) throw error

      return data.map(item => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock || 0) <= 10
      }))
    } catch (error) {
      console.error('Error fetching inventory by status:', error)
      throw error
    }
  }

  static async search(query: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name')

      if (error) throw error

      return data.map(item => ({
        ...item,
        supplier_name: item.suppliers?.name,
        low_stock_alert: (item.stock || 0) <= 10
      }))
    } catch (error) {
      console.error('Error searching inventory:', error)
      throw error
    }
  }

  static async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, stock, status, price, cost')

      if (error) throw error

      const stats = {
        total_items: data.length,
        total_value: 0,
        low_stock_count: 0,
        active_items: 0,
        inactive_items: 0,
        discontinued_items: 0
      }

      data.forEach(item => {
        // Calculate total inventory value
        if (item.stock && item.price) {
          stats.total_value += item.stock * item.price
        }

        // Count low stock items
        if ((item.stock || 0) <= 10 && item.status === 'active') {
          stats.low_stock_count++
        }

        // Count by status
        switch (item.status) {
          case 'active':
            stats.active_items++
            break
          case 'inactive':
            stats.inactive_items++
            break
          case 'discontinued':
            stats.discontinued_items++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error fetching inventory statistics:', error)
      throw error
    }
  }

  static async exportToCSV(): Promise<string> {
    try {
      const inventory = await this.getAll()
      const headers = [
        'ID', 'SKU', 'Tên sản phẩm', 'Trạng thái', 'Tồn kho', 
        'Giá bán', 'Giá nhập', 'Nhà cung cấp', 'Loại sản phẩm'
      ]
      
      const csvContent = [
        headers.join(','),
        ...inventory.map(item => [
          item.id,
          item.sku || '',
          item.name,
          item.status || '',
          item.stock || 0,
          item.price,
          item.cost || 0,
          item.supplier_name || '',
          item.type
        ].join(','))
      ].join('\n')
      
      return csvContent
    } catch (error) {
      console.error('Error exporting inventory:', error)
      throw error
    }
  }
}
