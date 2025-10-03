import { supabase } from './supabase'
import { Product, ProductInsert } from './supabase-types'

export interface CreateProductData {
  name: string
  description?: string
  status?: 'active' | 'inactive' | 'discontinued'
  price: number
  cost?: number
  sku?: string
  stock?: number
  supplier_id?: string
}

export interface UpdateProductData {
  id: string
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'discontinued'
  price?: number
  cost?: number
  sku?: string
  stock?: number
  supplier_id?: string
}

export class ProductsAPI {
  static async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  static async create(productData: CreateProductData): Promise<Product> {
    try {
      const productToInsert: ProductInsert = {
        ...productData,
        price: productData.price,
        cost: productData.cost || 0,
        sku: productData.sku || '',
        stock: productData.stock || 0,
        status: productData.status || 'active'
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async update(productData: UpdateProductData): Promise<Product> {
    try {
      const { id, ...updateData } = productData
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  static async getLowStock(minStock: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .lte('stock', minStock)
        .eq('status', 'active')
        .order('stock', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw error
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }
}
