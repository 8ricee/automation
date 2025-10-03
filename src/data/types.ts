// @/lib/types.ts

// Định nghĩa các kiểu dữ liệu dùng chung
export type UserRole = "admin" | "staff";
export type ProductType = "PHYSICAL" | "SERVICE";
export type Status = 
  | "active" 
  | "inactive" 
  | "in_progress" 
  | "completed" 
  | "accepted" 
  | "sent" 
  | "processing"
  | "pending"
  | "high"
  | "medium"
  | "low";

// Định nghĩa các interface cho từng bảng
export interface Employee {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  title: string;
  department: string;
  status: Status;
  role: UserRole;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  status: Status;
  date_added: string; // YYYY-MM-DD
  avatar_seed?: string;
  billing_address: string;
  shipping_address: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
}

export interface Product {
  id: number;
  name: string;
  status: Status;
  price: number;
  total_sales?: number;
  type: ProductType;
  created_at?: string; // ISO 8601
  sku?: string;
  stock?: number;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  status: Status;
  progress?: number;
  customer_id: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

export interface ProjectMember {
  project_id: number;
  employee_id: number;
  role?: string;
  join_date: string; // YYYY-MM-DD
}

export interface Task {
  id: number;
  task_code?: string;
  title: string;
  status: Status;
  priority?: Status;
  due_date?: string; // YYYY-MM-DD
  assignee_id?: number;
  project_id?: number;
}

export interface Timesheet {
  id: number;
  task_id?: number;
  employee_id: number;
  hours_worked: number;
  work_date: string; // YYYY-MM-DD
  description?: string;
  is_billable?: boolean;
}

export interface Quote {
  id: number;
  quote_number: string;
  customer_id: number;
  status: Status;
  issue_date: string; // YYYY-MM-DD
  expiry_date?: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id: number;
  quantity: number;
  price_per_unit: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  quote_id?: number;
  status: Status;
  order_date: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  shipping_address?: string;
  tracking_number?: string;
  shipping_provider?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_per_unit: number;
}

export interface Warranty {
  id: number;
  order_item_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  order_id: number;
  status: Status;
  issue_date: string; // YYYY-MM-DD
  due_date?: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  payment_date: string; // YYYY-MM-DD
  amount_paid: number;
  payment_method?: string;
  reference_code?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  status: Status;
  order_date: string; // YYYY-MM-DD
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  price_per_unit: number;
}