import type {
  Employee,
  Customer,
  Contact,
  Supplier,
  Product,
  Project,
  ProjectMember,
  Task,
  Timesheet,
  Quote,
  QuoteItem,
  Order,
  OrderItem,
  Warranty,
  Invoice,
  Payment,
  PurchaseOrder,
  PurchaseOrderItem,
} from '@/data/types';


export const employees: Employee[] = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password_hash: 'hashed_password_1', title: 'Manager', department: 'Administration', status: 'active', role: 'admin' },
  { id: 2, name: 'Sale User', email: 'sale@example.com', password_hash: 'hashed_password_2', title: 'Sales Representative', department: 'Sales', status: 'active', role: 'staff' },
  { id: 3, name: 'Tech User', email: 'tech@example.com', password_hash: 'hashed_password_3', title: 'Technician', department: 'Technical', status: 'active', role: 'staff' },
];

export const customers: Customer[] = [
  { id: 1, name: 'Công Ty TNHH ABC', email: 'contact@abc.com', company: 'ABC Company', status: 'active', date_added: '2023-01-15', avatar_seed: 'abc-avatar-seed', billing_address: '123 Đường ABC, Quận 1, TP. HCM', shipping_address: '123 Đường ABC, Quận 1, TP. HCM' },
  { id: 2, name: 'Doanh Nghiệp XYZ', email: 'info@xyz.com', company: 'XYZ Corp', status: 'active', date_added: '2023-02-20', avatar_seed: 'xyz-avatar-seed', billing_address: '456 Đường XYZ, Quận Ba Đình, Hà Nội', shipping_address: '789 Kho XYZ, Huyện An Dương, Hải Phòng' },
];

export const contacts: Contact[] = [
  { id: 1, customer_id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@abc.com', phone: '0912345678', position: 'Trưởng phòng Mua hàng' },
  { id: 2, customer_id: 2, name: 'Trần Thị Bình', email: 'binh.tran@xyz.com', phone: '0987654321', position: 'Kế toán trưởng' },
];

export const suppliers: Supplier[] = [
  { id: 1, name: 'Nhà Cung Cấp Thiết Bị Điện A', contact_person: 'Lê Văn Cường', email: 'cuong.le@supplier-a.com', phone: '0905111222', address: 'Khu Công Nghiệp A, Đồng Nai', tax_code: '0312345678' },
  { id: 2, name: 'Nhà Cung Cấp Vật Tư B', contact_person: 'Phạm Thị Dung', email: 'dung.pham@supplier-b.com', phone: '0905333444', address: 'Khu Công Nghiệp B, Bắc Ninh', tax_code: '0109876543' },
];

export const products: Product[] = [
  { id: 1, name: 'Biến tần 7.5kW', status: 'active', price: 15000000, total_sales: 10, type: 'PHYSICAL', sku: 'INV-7K5', stock: 50 },
  { id: 2, name: 'Động cơ 3 pha 5.5kW', status: 'active', price: 8500000, total_sales: 25, type: 'PHYSICAL', sku: 'MOT-5K5', stock: 100 },
  { id: 3, name: 'Dịch vụ lắp đặt tủ điện', status: 'active', price: 5000000, total_sales: 5, type: 'SERVICE', sku: 'SRV-INSTALL', stock: undefined },
];

export const projects: Project[] = [
  { id: 1, title: 'Dự án cải tạo hệ thống điện nhà máy ABC', description: 'Nâng cấp hệ thống tủ điện và biến tần cho dây chuyền sản xuất số 2.', status: 'in_progress', progress: 50, customer_id: 1, start_date: '2023-03-01', end_date: '2023-06-30' },
];

export const projectMembers: ProjectMember[] = [
  { project_id: 1, employee_id: 1, role: 'Project Manager', join_date: '2023-03-01' },
  { project_id: 1, employee_id: 3, role: 'Technical Lead', join_date: '2023-03-01' },
];

export const tasks: Task[] = [
  { id: 1, task_code: 'TSK-001', title: 'Khảo sát hiện trạng', status: 'completed', priority: 'high', due_date: '2023-03-10', assignee_id: 3, project_id: 1 },
  { id: 2, task_code: 'TSK-002', title: 'Lắp đặt tủ điện', status: 'in_progress', priority: 'high', due_date: '2023-04-15', assignee_id: 3, project_id: 1 },
];

export const timesheets: Timesheet[] = [
  { id: 1, task_id: 1, employee_id: 3, hours_worked: 8, work_date: '2023-03-05', description: 'Thực hiện khảo sát và đo đạc tại nhà máy.', is_billable: true },
];

export const quotes: Quote[] = [
  { id: 1, quote_number: 'Q-2023-001', customer_id: 1, status: 'accepted', issue_date: '2023-02-25', expiry_date: '2023-03-25', subtotal: 23500000, vat_rate: 0.1, vat_amount: 2350000, shipping_fee: 500000, total_amount: 26350000 },
];

export const quoteItems: QuoteItem[] = [
  { id: 1, quote_id: 1, product_id: 1, quantity: 1, price_per_unit: 15000000 },
  { id: 2, quote_id: 1, product_id: 2, quantity: 1, price_per_unit: 8500000 },
];

export const orders: Order[] = [
  { id: 1, order_number: 'ORD-2023-001', customer_id: 1, quote_id: 1, status: 'processing', order_date: '2023-03-01', subtotal: 23500000, vat_rate: 0.1, vat_amount: 2350000, shipping_fee: 500000, total_amount: 26350000, shipping_address: '123 Đường ABC, Quận 1, TP. HCM' },
];

export const orderItems: OrderItem[] = [
  { id: 1, order_id: 1, product_id: 1, quantity: 1, price_per_unit: 15000000 },
  { id: 2, order_id: 1, product_id: 2, quantity: 1, price_per_unit: 8500000 },
];

export const warranties: Warranty[] = [
  { id: 1, order_item_id: 1, start_date: '2023-03-15', end_date: '2024-03-15', notes: 'Bảo hành 12 tháng cho biến tần' },
  { id: 2, order_item_id: 2, start_date: '2023-03-15', end_date: '2024-09-15', notes: 'Bảo hành 18 tháng cho động cơ' },
];

export const invoices: Invoice[] = [
  { id: 1, invoice_number: 'INV-2023-001', customer_id: 1, order_id: 1, status: 'sent', issue_date: '2023-03-05', due_date: '2023-03-20', subtotal: 23500000, vat_rate: 0.1, vat_amount: 2350000, shipping_fee: 500000, total_amount: 26350000 },
];

export const payments: Payment[] = [
  { id: 1, invoice_id: 1, payment_date: '2023-03-10', amount_paid: 26350000, payment_method: 'bank_transfer', reference_code: 'CK20230310ABC' },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 1, po_number: 'PO-2023-001', supplier_id: 1, status: 'completed', order_date: '2023-01-20', subtotal: 135000000, vat_rate: 0.08, vat_amount: 10800000, shipping_fee: 1000000, total_amount: 146800000 },
];

export const purchaseOrderItems: PurchaseOrderItem[] = [
  { id: 1, purchase_order_id: 1, product_id: 1, quantity: 10, price_per_unit: 13500000 },
];
