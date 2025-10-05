// @/lib/types.ts

// Định nghĩa các kiểu dữ liệu dùng chung theo SQL schema
export type UserRole = "admin" | "manager" | "staff" | "viewer";
export type ProductType = "PHYSICAL" | "DIGITAL" | "SERVICE";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "cash" | "bank_transfer" | "credit_card" | "check";
export type ChangeType = "purchase_received" | "sale" | "return" | "adjustment";

// Định nghĩa các interface cho từng bảng theo SQL schema
export interface Employee {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
  status: "active" | "inactive" | "terminated";
  role: UserRole;
  hourly_rate?: number;
  hire_date: string;
  password_hash: string;
}

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  company?: string;
  status: "active" | "inactive" | "pending";
  date_added: string; // YYYY-MM-DD
  avatar_seed?: string;
  billing_address?: string;
  shipping_address?: string;
  tax_code?: string;
}

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  notes?: string;
}

export interface Supplier {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
}

export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "discontinued";
  price: number;
  cost?: number;
  total_sales?: number;
  type: ProductType;
  sku?: string;
  stock?: number;
  supplier_id?: string;
  warranty_period_months?: number;
}

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  status: "planning" | "in_progress" | "completed" | "cancelled";
  progress?: number;
  customer_id?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  budget?: number;
  project_manager_id?: string;
  billable_rate?: number;
}

export interface ProjectMember {
  id: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  employee_id: string;
  role?: string;
}

export interface Task {
  id: string;
  created_at: string;
  updated_at: string;
  task_code?: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string; // YYYY-MM-DD
  assignee_id?: string;
  project_id?: string;
  estimated_hours?: number;
  completed_hours?: number;
  billable: boolean;
}

export interface Timesheet {
  id: string;
  stworzone: string;
  updated_at: string;
  task_id?: string;
  employee_id: string;
  hours_worked: number;
  work_date: string; // YYYY-MM-DD
  description?: string;
  is_billable: boolean;
  billing_rate?: number;
}

export interface Quote {
  id: string;
  created_at: string;
  updated_at: string;
  quote_number: string;
  customer_id?: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  issue_date: string; // YYYY-MM-DD
  expiry_date?: string; // YYYY-MM-DD
  valid_for_days?: number;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  notes?: string;
}

export interface QuoteItem {
  id: string;
  created_at: string;
  updated_at: string;
  quote_id: string;
  product_id?: string;
  custom_description?: string;
  quantity: number;
  price_perunit: number;
  discount_percentage?: number;
  total_price: number;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  customer_id?: string;
  quote_id?: string;
  status: OrderStatus;
  order_date: string; // YYYY-MM-DD
  required_delivery_date?: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  shipping_address?: string;
  tracking_number?: string;
  shipping_provider?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  created_at: string;
  updated_at: string;
  order_id: string;
  product_id?: string;
  custom_description?: string;
  quantity: number;
  price_perunit: number;
  total_price: number;
}

export interface Warranty {
  id: string;
  created_at: string;
  updated_at: string;
  order_item_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: "active" | "expired" | "void";
  notes?: string;
  claim_count: number;
}

export interface Invoice {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_number: string;
  customer_id?: string;
  order_id?: string;
  status: InvoiceStatus;
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  paid_amount?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_id: string;
  payment_date: string; // YYYY-MM-DD
  amount_paid: number;
  payment_method: PaymentMethod;
  reference_code?: string;
  notes?: string;
  payment_status: PaymentStatus;
}

export interface PurchaseOrder {
  id: string;
  created_at: string;
  updated_at: string;
  po_number: string;
  supplier_id?: string;
  status: "pending" | "approved" | "ordered" | "received" | "cancelled";
  order_date: string; // YYYY-MM-DD
  expected_delivery_date?: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  created_at: string;
  updated_at: string;
  purchase_order_id: string;
  product_id?: string;
  supplier_product_code?: string;
  quantity: number;
  price_perunit: number;
  total_price: number;
}

export interface InventoryLog {
  id: string;
  created_at: string;
  product_id: string;
  change_type: ChangeType;
  quantity_change: number;
  new_stock_level: number;
  reference_id?: string;
  notes?: string;
  recorded_by_employee_id?: string;
}
