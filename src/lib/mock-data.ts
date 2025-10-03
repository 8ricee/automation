// Mock data for development when Supabase is not available
import { Product, Customer, Employee, Order, Quote } from './supabase-types';

export const mockProducts: Product[] = [
  {
    id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    name: 'Laptop Dell XPS 13',
    description: 'Laptop cao cấp cho doanh nghiệp',
    status: 'active',
    price: 25000000,
    cost: 20000000,
    total_sales: 25,
    type: 'PHYSICAL',
    sku: 'LP-DELL-XPS13-001',
    stock: 15,
    supplier_id: 'sup-1',
    warranty_period_months: 24
  },
  {
    id: '2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    name: 'Mouse Logitech MX Master 3',
    description: 'Chuột không dây với precision',
    status: 'active',
    price: 2400000,
    cost: 1800000,
    total_sales: 120,
    type: 'PHYSICAL',
    sku: 'MS-LOGI-MX3-001',
    stock: 8,
    supplier_id: 'sup-2',
    warranty_period_months: 12
  },
  {
    id: '3',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    name: 'Phần mềm Microsoft Office 365',
    description: 'Bộ ứng dụng văn phòng Microsoft',
    status: 'active',
    price: 3500000,
    cost: 2500000,
    total_sales: 45,
    type: 'DIGITAL',
    sku: 'SW-MS-OFF365-001',
    stock: 999,
    supplier_id: 'sup-3',
    warranty_period_months: 12
  },
  {
    id: '4',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    name: 'Dịch vụ tư vấn IT',
    description: 'Tư vấn và hỗ trợ công nghệ thông tin',
    status: 'active',
    price: 500000,
    cost: 300000,
    total_sales: 0,
    type: 'SERVICE',
    sku: 'SRV-IT-CONS-001',
    stock: 0,
    supplier_id: 'sup-4',
    warranty_period_months: 0
  },
  {
    id: '5',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    name: 'Monitor LG UltraWide 34',
    description: 'Màn hình cong 34 inch 4K',
    status: 'active',
    price: 12000000,
    cost: 9500000,
    total_sales: 8,
    type: 'PHYSICAL',
    sku: 'MON-LG-UW34-001',
    stock: 3,
    supplier_id: 'sup-5',
    warranty_period_months: 36
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    name: 'Công ty TNHH ABC',
    email: 'info@abc-corp.com',
    company: 'ABC Corporation',
    status: 'active',
    date_added: '2024-01-01',
    avatar_seed: 'abc',
    billing_address: '123 Đường Nguyễn Huệ, Q1, TP.HCM',
    shipping_address: '123 Đường Nguyễn Huệ, Q1, TP.HCM',
    tax_code: '0123456789'
  },
  {
    id: 'cust-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    name: 'Nguyễn Văn A',
    email: 'nguyen.a@example.com',
    company: null,
    status: 'active',
    date_added: '2024-01-02',
    avatar_seed: 'nguyen',
    billing_address: '456 Đường Lê Lợi, Q3, TP.HCM',
    shipping_address: '456 Đường Lê Lợi, Q3, TP.HCM',
    tax_code: null
  },
  {
    id: 'cust-3',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    name: 'Phạm Thị Tuyết',
    email: 'pham.tuyet@company.vn',
    company: 'TekNo Company',
    status: 'active',
    date_added: '2024-01-03',
    avatar_seed: 'pham',
    billing_address: '789 Đường Cao Bá Quát, Q2, TP.HCM',
    shipping_address: '789 Đường Cao Bá Quát, Q2, TP.HCM',
    tax_code: '9876543210'
  }
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    name: 'Trần Minh Khang',
    email: 'tran.khang@company.com',
    title: 'Giám đốc điều hành',
    department: 'Quản lý',
    status: 'active',
    role: 'manager',
    hourly_rate: 150000,
    hire_date: '2023-01-01'
  },
  {
    id: 'emp-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    name: 'Nguyễn Thị Lan',
    email: 'nguyen.lan@company.com',
    title: 'Nhân viên kinh doanh',
    department: 'Kinh doanh',
    status: 'active',
    role: 'staff',
    hourly_rate: 80000,
    hire_date: '2023-02-15'
  },
  {
    id: 'emp-3',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    name: 'Lê Văn Đức',
    email: 'le.duc@company.com',
    title: 'Developer Senior',
    department: 'IT',
    status: 'active',
    role: 'staff',
    hourly_rate: 120000,
    hire_date: '2023-03-01'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    order_number: 'ORD-2024-001',
    customer_id: 'cust-1',
    status: 'confirmed',
    order_date: '2024-01-01',
    delivery_address: '123 Đường Nguyễn Huệ, Q1, TP.HCM',
    shipping_fee: 50000,
    subtotal: 27000000,
    vat_rate: 10,
    vat_amount: 2700000,
    total_amount: 29750000,
    notes: 'Giao hàng trong vòng 3 ngày'
  },
  {
    id: 'order-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    order_number: 'ORD-2024-002',
    customer_id: 'cust-2',
    status: 'processing',
    order_date: '2024-01-02',
    delivery_address: '456 Đường Lê Lợi, Q3, TP.HCM',
    shipping_fee: 30000,
    subtotal: 2400000,
    vat_rate: 10,
    vat_amount: 240000,
    total_amount: 2670000,
    notes: null
  }
];

export const mockQuotes: Quote[] = [
  {
    id: 'quote-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    quote_number: 'QUO-2024-001',
    customer_id: 'cust-1',
    status: 'sent',
    issue_date: '2024-01-01',
    expiry_date: '2024-02-01',
    valid_for_days: 30,
    subtotal: 35000000,
    vat_rate: 10,
    vat_amount: 3500000,
    shipping_fee: 100000,
    total_amount: 38600000,
    notes: 'Báo giá cho dự án digital transformation'
  },
  {
    id: 'quote-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    quote_number: 'QUO-2024-002',
    customer_id: 'cust-3',
    status: 'accepted',
    issue_date: '2024-01-02',
    expiry_date: '2024-02-02',
    valid_for_days: 30,
    subtotal: 15000000,
    vat_rate: 10,
    vat_amount: 1500000,
    shipping_fee: 50000,
    total_amount: 16550000,
    notes: 'Dự án phần mềm quản lý kho'
  }
];
