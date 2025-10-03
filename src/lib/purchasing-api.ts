import { supabase } from './supabase'

// Define purchase order types based on schema
export type PurchaseOrder = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  po_number: string;
  supplier_id: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date: string | null;
  received_date: string | null;
  subtotal: number | null;
  vat_rate: number | null;
  vat_amount: number | null;
  shipping_fee: number | null;
  total_amount: number | null;
  notes: string | null;
};

export type PurchaseOrderInsert = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>;
export type PurchaseOrderUpdate = Partial<PurchaseOrderInsert>;

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number | null;
}

export class PurchasingAPI {
  static async getAll(): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person, email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<PurchaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person, email
          ),
          purchaseorder_items (
            *,
            products (
              name, sku
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching purchase order:', error)
      throw error
    }
  }

  static async create(poData: PurchaseOrderInsert): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .insert(poData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating purchase order:', error)
      throw error
    }
  }

  static async update(id: string, updates: PurchaseOrderUpdate): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating purchase order:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('purchaseorders')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting purchase order:', error)
      throw error
    }
  }

  static async updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating purchase order status:', error)
      throw error
    }
  }

  static async getByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching purchase orders by status:', error)
      throw error
    }
  }

  static async getBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching purchase orders by supplier:', error)
      throw error
    }
  }

  static async getOverdueOrders(): Promise<PurchaseOrder[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person
          )
        `)
        .lt('expected_delivery_date', today)
        .in('status', ['ordered', 'pending'])
        .order('expected_delivery_date')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching overdue purchase orders:', error)
      throw error
    }
  }

  static async search(query: string): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select(`
          *,
          suppliers (
            name, contact_person
          )
        `)
        .or(`po_number.ilike.%${query}%,notes.ilike.%${query}%,suppliers.name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching purchase orders:', error)
      throw error
    }
  }

  static async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select('id, status, total_amount, order_date')

      if (error) throw error

      const stats = {
        total_orders: data.length,
        total_value: 0,
        draft_orders: 0,
        pending_orders: 0,
        approved_orders: 0,
        ordered_orders: 0,
        received_orders: 0,
        cancelled_orders: 0,
        avg_delivery_time: 0
      }

      const totalDeliveryDays = 0
      const ordersWithDelivery = 0

      data.forEach(order => {
        if (order.total_amount) {
          stats.total_value += order.total_amount
        }

        switch (order.status) {
          case 'draft':
            stats.draft_orders++
            break
          case 'pending':
            stats.pending_orders++
            break
          case 'approved':
            stats.approved_orders++
            break
          case 'ordered':
            stats.ordered_orders++
            break
          case 'received':
            stats.received_orders++
            break
          case 'cancelled':
            stats.cancelled_orders++
            break
        }
      })

      if (ordersWithDelivery > 0) {
        stats.avg_delivery_time = totalDeliveryDays / ordersWithDelivery
      }

      return stats
    } catch (error) {
      console.error('Error fetching purchasing statistics:', error)
      throw error
    }
  }

  static async exportToCSV(): Promise<string> {
    try {
      const orders = await this.getAll()
      const headers = [
        'ID', 'Số PO', 'Nhà cung cấp', 'Trạng thái', 
        'Ngày đặt hàng', 'Ngày giao hàng dự kiến', 'Tổng tiền', 'Ghi chú'
      ]
      
      const csvContent = [
        headers.join(','),
        ...orders.map(order => [
          order.id,
          order.po_number,
          order.suppliers?.name || '',
          order.status || '',
          order.order_date,
          order.expected_delivery_date || '',
          order.total_amount || 0,
          order.notes || ''
        ].join(','))
      ].join('\n')
      
      return csvContent
    } catch (error) {
      console.error('Error exporting purchase orders:', error)
      throw error
    }
  }

  // Purchase Order Items API
  static async addItem(itemData: Omit<PurchaseOrderItem, 'id'>): Promise<PurchaseOrderItem> {
    try {
      const { data, error } = await supabase
        .from('purchaseorder_items')
        .insert(itemData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding purchase order item:', error)
      throw error
    }
  }

  static async updateItemQuantity(itemId: string, receivedQuantity: number): Promise<PurchaseOrderItem> {
    try {
      const { data, error } = await supabase
        .from('purchaseorder_items')
        .update({ received_quantity: receivedQuantity })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating item quantity:', error)
      throw error
    }
  }

  static async deleteItem(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('purchaseorder_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting purchase order item:', error)
      throw error
    }
  }
}
