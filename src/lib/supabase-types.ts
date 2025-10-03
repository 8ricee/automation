// Supabase Types from comprehensive schema
export type DbEnums = {
  user_role: 'admin' | 'manager' | 'staff' | 'viewer'
  invoice_status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  product_type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
}

export type Tables = {
  customers: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    email: string
    company: string | null
    status: 'active' | 'inactive' | 'pending' | null
    date_added: string
    avatar_seed: string | null
    billing_address: string | null
    shipping_address: string | null
    tax_code: string | null
  }
  employees: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    email: string
    title: string | null
    department: string | null
    status: 'active' | 'inactive' | 'terminated' | null
    role: DbEnums['user_role']
    hourly_rate: number | null
    hire_date: string
  }
  suppliers: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    tax_code: string | null
  }
  products: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    description: string | null
    status: 'active' | 'inactive' | 'discontinued' | null
    price: number
    cost: number | null
    total_sales: number | null
    type: DbEnums['product_type']
    sku: string | null
    stock: number | null
    supplier_id: string | null
    warranty_period_months: number | null
  }
  quotes: {
    id: string
    created_at: string | null
    updated_at: string | null
    quote_number: string
    customer_id: string | null
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | null
    issue_date: string
    expiry_date: string | null
    valid_for_days: number | null
    subtotal: number | null
    vat_rate: number | null
    vat_amount: number | null
    shipping_fee: number | null
    total_amount: number | null
    notes: string | null
  }
  quote_items: {
    id: string
    created_at: string | null
    updated_at: string | null
    quote_id: string | null
    product_id: string | null
    custom_description: string | null
    quantity: number | null
    price_perunit: number | null
    discount_percentage: number | null
    total_price: number | null
  }
  orders: {
    id: string
    created_at: string | null
    updated_at: string | null
    order_number: string
    customer_id: string | null
    quote_id: string | null
    status: DbEnums['order_status']
    order_date: string
    required_delivery_date: string | null
    subtotal: number | null
    vat_rate: number | null
    vat_amount: number | null
    shipping_fee: number | null
    total_amount: number | null
    shipping_address: string | null
    tracking_number: string | null
    shipping_provider: string | null
    notes: string | null
  }
  order_items: {
    id: string
    created_at: string | null
    updated_at: string | null
    order_id: string | null
    product_id: string | null
    custom_description: string | null
    quantity: number | null
    price_perunit: number | null
    total_price: number | null
  }
}

export type TablesInsert<T extends keyof Tables> = Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>
export type TablesUpdate<T extends keyof Tables> = Partial<TablesInsert<T>>

// Specific aliases for convenience
export type Customer = Tables['customers']
export type CustomerInsert = TablesInsert<'customers'>
export type CustomerUpdate = TablesUpdate<'customers'>

export type Employee = Tables['employees']
export type EmployeeInsert = TablesInsert<'employees'>
export type EmployeeUpdate = TablesUpdate<'employees'>

export type Supplier = Tables['suppliers']
export type SupplierInsert = TablesInsert<'suppliers'>
export type SupplierUpdate = TablesUpdate<'suppliers'>

export type Product = Tables['products']
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

export type Quote = Tables['quotes']
export type QuoteInsert = TablesInsert<'quotes'>
export type QuoteUpdate = TablesUpdate<'quotes'>

export type Order = Tables['orders']
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>

// Helper type for API responses
export type ApiListResponse<T> = {
  data: T[]
  count: number
  error?: string
}

export type ApiResponse<T> = {
  data: T | null
  error?: string
}
