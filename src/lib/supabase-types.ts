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
    email: string | null
    phone: string | null
    company: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    website: string | null
    industry: string | null
    customer_type: 'individual' | 'business' | null
    status: 'active' | 'inactive' | 'pending' | null
    notes: string | null
  }
  employees: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    email: string | null
    phone: string | null
    position: string | null
    department: string | null
    hire_date: string | null
    salary: number | null
    employee_id: string | null
    manager_id: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    status: 'active' | 'inactive' | 'terminated' | null
    notes: string | null
    role_id: string | null
    is_active: boolean | null
    last_login: string | null
    password_hash: string | null
  }
  suppliers: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    email: string | null
    phone: string | null
    contact_person: string | null
    company: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    website: string | null
    payment_terms: string | null
    status: 'active' | 'inactive' | 'pending' | null
    notes: string | null
  }
  products: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    sku: string | null
    description: string | null
    category: string | null
    brand: string | null
    price: number
    cost: number | null
    stock_quantity: number | null
    min_stock_level: number | null
    max_stock_level: number | null
    unit: string | null
    weight: number | null
    dimensions: string | null
    supplier_id: string | null
    warranty_period_months: number | null
    status: 'active' | 'inactive' | 'discontinued' | null
    notes: string | null
  }
  quotes: {
    id: string
    created_at: string | null
    updated_at: string | null
    quote_number: string
    customer_id: string | null
    quote_date: string | null
    expiry_date: string | null
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | null
    subtotal: number | null
    tax_amount: number | null
    discount_amount: number | null
    total_amount: number | null
    terms_and_conditions: string | null
    notes: string | null
    created_by: string | null
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
    notes: string | null
  }
  orders: {
    id: string
    created_at: string | null
    updated_at: string | null
    order_number: string
    customer_id: string | null
    order_date: string | null
    delivery_date: string | null
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | null
    total_amount: number | null
    tax_amount: number | null
    discount_amount: number | null
    shipping_address: string | null
    billing_address: string | null
    payment_method: string | null
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | null
    notes: string | null
    created_by: string | null
  }
  order_items: {
    id: string
    created_at: string | null
    updated_at: string | null
    order_id: string | null
    product_id: string | null
    quantity: number | null
    unit_price: number | null
    discount_percentage: number | null
    total_price: number | null
    notes: string | null
  }
  projects: {
    id: string
    created_at: string | null
    updated_at: string | null
    name: string
    description: string | null
    customer_id: string | null
    project_manager_id: string | null
    start_date: string | null
    end_date: string | null
    status: 'planning' | 'in_progress' | 'completed' | 'cancelled' | null
    priority: 'low' | 'medium' | 'high' | 'urgent' | null
    budget: number | null
    actual_cost: number | null
    progress_percentage: number | null
    notes: string | null
  }
  tasks: {
    id: string
    created_at: string | null
    updated_at: string | null
    title: string
    description: string | null
    project_id: string | null
    assignee_id: string | null
    status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled' | null
    priority: 'low' | 'medium' | 'high' | 'urgent' | null
    due_date: string | null
    estimated_hours: number | null
    actual_hours: number | null
    progress_percentage: number | null
    notes: string | null
  }
  purchase_orders: {
    id: string
    created_at: string | null
    updated_at: string | null
    po_number: string
    supplier_id: string | null
    order_date: string | null
    delivery_date: string | null
    status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled' | null
    subtotal: number | null
    tax_amount: number | null
    discount_amount: number | null
    total_amount: number | null
    payment_terms: string | null
    shipping_address: string | null
    notes: string | null
    created_by: string | null
  }
  purchase_order_items: {
    id: string
    created_at: string | null
    updated_at: string | null
    purchase_order_id: string | null
    product_id: string | null
    quantity: number | null
    unit_price: number | null
    discount_percentage: number | null
    total_price: number | null
    notes: string | null
  }
  contacts: {
    id: string
    created_at: string | null
    updated_at: string | null
    customer_id: string | null
    name: string
    email: string | null
    phone: string | null
    position: string | null
    is_primary: boolean | null
    notes: string | null
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

export type Project = Tables['projects']
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export type Task = Tables['tasks']
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>


export type PurchaseOrder = Tables['purchase_orders']
export type PurchaseOrderInsert = TablesInsert<'purchase_orders'>
export type PurchaseOrderUpdate = TablesUpdate<'purchase_orders'>

export type PurchaseOrderItem = Tables['purchase_order_items']
export type PurchaseOrderItemInsert = TablesInsert<'purchase_order_items'>
export type PurchaseOrderItemUpdate = TablesUpdate<'purchase_order_items'>

export type Contact = Tables['contacts']
export type ContactInsert = TablesInsert<'contacts'>
export type ContactUpdate = TablesUpdate<'contacts'>

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
