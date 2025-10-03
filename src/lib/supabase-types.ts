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
    role: 'admin' | 'director' | 'manager' | 'sales' | 'engineer' | 'accountant' | 'warehouse' | null
    hourly_rate: number | null
    hire_date: string
    password_hash: string | null
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
  projects: {
    id: string
    created_at: string | null
    updated_at: string | null
    title: string
    description: string | null
    status: 'planning' | 'in_progress' | 'completed' | 'cancelled' | null
    progress: number | null
    customer_id: string | null
    start_date: string | null
    end_date: string | null
    budget: number | null
    project_manager_id: string | null
    billable_rate: number | null
  }
  project_members: {
    id: string
    created_at: string | null
    updated_at: string | null
    project_id: string | null
    employee_id: string | null
    role: string | null
  }
  tasks: {
    id: string
    created_at: string | null
    updated_at: string | null
    task_code: string | null
    title: string
    description: string | null
    status: 'todo' | 'in_progress' | 'completed' | 'cancelled' | null
    priority: 'low' | 'medium' | 'high' | 'urgent' | null
    due_date: string | null
    assignee_id: string | null
    project_id: string | null
    estimated_hours: number | null
    completed_hours: number | null
    billable: boolean | null
  }
  timesheets: {
    id: string
    stworzone: string | null
    updated_at: string | null
    task_id: string | null
    employee_id: string | null
    hours_worked: number | null
    work_date: string | null
    description: string | null
    is_billable: boolean | null
    billing_rate: number | null
  }
  invoices: {
    id: string
    created_at: string | null
    updated_at: string | null
    invoice_number: string
    customer_id: string | null
    order_id: string | null
    status: DbEnums['invoice_status']
    issue_date: string
    due_date: string
    subtotal: number | null
    vat_rate: number | null
    vat_amount: number | null
    shipping_fee: number | null
    total_amount: number | null
    paid_amount: number | null
    notes: string | null
  }
  payments: {
    id: string
    created_at: string | null
    updated_at: string | null
    invoice_id: string | null
    payment_date: string | null
    amount_paid: number | null
    payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | null
    reference_code: string | null
    notes: string | null
    payment_status: DbEnums['payment_status']
  }
  purchaseorders: {
    id: string
    created_at: string | null
    updated_at: string | null
    po_number: string
    supplier_id: string | null
    status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled' | null
    order_date: string
    expected_delivery_date: string | null
    subtotal: number | null
    vat_rate: number | null
    vat_amount: number | null
    shipping_fee: number | null
    total_amount: number | null
    notes: string | null
  }
  purchaseorder_items: {
    id: string
    created_at: string | null
    updated_at: string | null
    purchase_order_id: string | null
    product_id: string | null
    supplier_product_code: string | null
    quantity: number | null
    price_perunit: number | null
    total_price: number | null
  }
  warranties: {
    id: string
    created_at: string | null
    updated_at: string | null
    order_item_id: string | null
    start_date: string
    end_date: string
    status: 'active' | 'expired' | 'void' | null
    notes: string | null
    claim_count: number | null
  }
  inventory_logs: {
    id: string
    created_at: string | null
    product_id: string | null
    change_type: 'purchase_received' | 'sale' | 'return' | 'adjustment' | null
    quantity_change: number | null
    new_stock_level: number | null
    reference_id: string | null
    notes: string | null
    recorded_by_employee_id: string | null
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

export type Invoice = Tables['invoices']
export type InvoiceInsert = TablesInsert<'invoices'>
export type InvoiceUpdate = TablesUpdate<'invoices'>

export type Payment = Tables['payments']
export type PaymentInsert = TablesInsert<'payments'>
export type PaymentUpdate = TablesUpdate<'payments'>

export type PurchaseOrder = Tables['purchaseorders']
export type PurchaseOrderInsert = TablesInsert<'purchaseorders'>
export type PurchaseOrderUpdate = TablesUpdate<'purchaseorders'>

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
