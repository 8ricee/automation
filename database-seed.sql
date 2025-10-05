-- Script để tạo dữ liệu mẫu cho database
-- Chạy script này trong Supabase SQL Editor

-- 1. Tạo roles
INSERT INTO public.roles (id, name, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Administrator với quyền cao nhất', true),
('550e8400-e29b-41d4-a716-446655440002', 'manager', 'Manager với quyền quản lý', true),
('550e8400-e29b-41d4-a716-446655440003', 'employee', 'Nhân viên thông thường', true);

-- 2. Tạo permissions
INSERT INTO public.permissions (id, name, resource, action, description) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'dashboard:view', 'dashboard', 'view', 'Xem dashboard'),
('660e8400-e29b-41d4-a716-446655440002', 'customers:view', 'customers', 'view', 'Xem danh sách khách hàng'),
('660e8400-e29b-41d4-a716-446655440003', 'customers:create', 'customers', 'create', 'Tạo khách hàng mới'),
('660e8400-e29b-41d4-a716-446655440004', 'customers:edit', 'customers', 'edit', 'Chỉnh sửa khách hàng'),
('660e8400-e29b-41d4-a716-446655440005', 'customers:delete', 'customers', 'delete', 'Xóa khách hàng'),
('660e8400-e29b-41d4-a716-446655440006', 'products:view', 'products', 'view', 'Xem danh sách sản phẩm'),
('660e8400-e29b-41d4-a716-446655440007', 'products:create', 'products', 'create', 'Tạo sản phẩm mới'),
('660e8400-e29b-41d4-a716-446655440008', 'products:edit', 'products', 'edit', 'Chỉnh sửa sản phẩm'),
('660e8400-e29b-41d4-a716-446655440009', 'products:delete', 'products', 'delete', 'Xóa sản phẩm'),
('660e8400-e29b-41d4-a716-446655440010', 'orders:view', 'orders', 'view', 'Xem danh sách đơn hàng'),
('660e8400-e29b-41d4-a716-446655440011', 'orders:create', 'orders', 'create', 'Tạo đơn hàng mới'),
('660e8400-e29b-41d4-a716-446655440012', 'orders:edit', 'orders', 'edit', 'Chỉnh sửa đơn hàng'),
('660e8400-e29b-41d4-a716-446655440013', 'employees:view', 'employees', 'view', 'Xem danh sách nhân viên'),
('660e8400-e29b-41d4-a716-446655440014', 'employees:create', 'employees', 'create', 'Tạo nhân viên mới'),
('660e8400-e29b-41d4-a716-446655440015', 'employees:edit', 'employees', 'edit', 'Chỉnh sửa nhân viên'),
('660e8400-e29b-41d4-a716-446655440016', 'roles:manage', 'roles', 'manage', 'Quản lý roles và permissions');

-- 3. Gán permissions cho roles
-- Admin có tất cả quyền
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440007'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440008'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440009'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440013'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440015'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440016');

-- Manager có quyền xem và chỉnh sửa (không có delete và manage roles)
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440007'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440013');

-- Employee chỉ có quyền xem
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440010');

-- 4. Tạo employees mẫu
INSERT INTO public.employees (id, name, email, position, department, role_id, is_active, employee_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@anhminhtsc.com', 'Administrator', 'IT', '550e8400-e29b-41d4-a716-446655440001', true, 'EMP001'),
('770e8400-e29b-41d4-a716-446655440002', 'Manager User', 'manager@anhminhtsc.com', 'Manager', 'Sales', '550e8400-e29b-41d4-a716-446655440002', true, 'EMP002'),
('770e8400-e29b-41d4-a716-446655440003', 'Employee User', 'employee@anhminhtsc.com', 'Employee', 'General', '550e8400-e29b-41d4-a716-446655440003', true, 'EMP003'),
('770e8400-e29b-41d4-a716-446655440004', 'Test User', '8ricee@anhminhtsc.com', 'Employee', 'General', '550e8400-e29b-41d4-a716-446655440003', true, 'EMP004');

-- 5. Tạo customers mẫu
INSERT INTO public.customers (id, name, email, phone, company, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Công Ty ABC', 'contact@abc.com', '+84 123 456 789', 'ABC Company', 'active'),
('880e8400-e29b-41d4-a716-446655440002', 'Doanh Nghiệp XYZ', 'info@xyz.com', '+84 987 654 321', 'XYZ Corp', 'active'),
('880e8400-e29b-41d4-a716-446655440003', 'Khách Hàng Test', 'test@example.com', '+84 111 222 333', 'Test Corp', 'active');

-- 6. Tạo products mẫu
INSERT INTO public.products (id, name, sku, description, price, stock_quantity, status) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Sản phẩm A', 'SPA-001', 'Mô tả sản phẩm A', 100000, 50, 'active'),
('990e8400-e29b-41d4-a716-446655440002', 'Sản phẩm B', 'SPB-002', 'Mô tả sản phẩm B', 200000, 30, 'active'),
('990e8400-e29b-41d4-a716-446655440003', 'Sản phẩm C', 'SPC-003', 'Mô tả sản phẩm C', 150000, 25, 'active');

-- 7. Tạo orders mẫu
INSERT INTO public.orders (id, order_number, customer_id, order_date, status, total_amount, created_by) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'ORD-001', '880e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'pending', 300000, '770e8400-e29b-41d4-a716-446655440002'),
('aa0e8400-e29b-41d4-a716-446655440002', 'ORD-002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'processing', 450000, '770e8400-e29b-41d4-a716-446655440002');

-- 8. Tạo projects mẫu
INSERT INTO public.projects (id, name, description, customer_id, project_manager_id, start_date, status, budget) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Dự án ABC', 'Mô tả dự án ABC', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'planning', 10000000),
('bb0e8400-e29b-41d4-a716-446655440002', 'Dự án XYZ', 'Mô tả dự án XYZ', '880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'active', 15000000);

-- 9. Tạo tasks mẫu
INSERT INTO public.tasks (id, title, description, project_id, assignee_id, status, priority, due_date) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'Task 1', 'Mô tả task 1', 'bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'todo', 'high', CURRENT_DATE + INTERVAL '7 days'),
('cc0e8400-e29b-41d4-a716-446655440002', 'Task 2', 'Mô tả task 2', 'bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'in_progress', 'medium', CURRENT_DATE + INTERVAL '14 days');

-- 10. Tạo suppliers mẫu
INSERT INTO public.suppliers (id, name, email, phone, contact_person, company, status) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'Nhà cung cấp A', 'supplier@supplier-a.com', '+84 555 666 777', 'Nguyễn Văn A', 'Supplier A Corp', 'active'),
('dd0e8400-e29b-41d4-a716-446655440002', 'Nhà cung cấp B', 'supplier@supplier-b.com', '+84 888 999 000', 'Trần Thị B', 'Supplier B Corp', 'active');

-- 11. Tạo quotes mẫu
INSERT INTO public.quotes (id, quote_number, customer_id, quote_date, expiry_date, status, total_amount, created_by) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'QUO-001', '880e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'draft', 500000, '770e8400-e29b-41d4-a716-446655440002'),
('ee0e8400-e29b-41d4-a716-446655440002', 'QUO-002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'sent', 750000, '770e8400-e29b-41d4-a716-446655440002');

-- 12. Tạo purchase_orders mẫu
INSERT INTO public.purchase_orders (id, po_number, supplier_id, order_date, delivery_date, status, total_amount, created_by) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'PO-001', 'dd0e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'pending', 200000, '770e8400-e29b-41d4-a716-446655440002'),
('ff0e8400-e29b-41d4-a716-446655440002', 'PO-002', 'dd0e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', 'approved', 350000, '770e8400-e29b-41d4-a716-446655440002');

-- Kiểm tra dữ liệu đã được tạo
SELECT 'Roles created:' as info, count(*) as count FROM public.roles;
SELECT 'Permissions created:' as info, count(*) as count FROM public.permissions;
SELECT 'Role permissions created:' as info, count(*) as count FROM public.role_permissions;
SELECT 'Employees created:' as info, count(*) as count FROM public.employees;
SELECT 'Customers created:' as info, count(*) as count FROM public.customers;
SELECT 'Products created:' as info, count(*) as count FROM public.products;
SELECT 'Orders created:' as info, count(*) as count FROM public.orders;
SELECT 'Projects created:' as info, count(*) as count FROM public.projects;
SELECT 'Tasks created:' as info, count(*) as count FROM public.tasks;
SELECT 'Suppliers created:' as info, count(*) as count FROM public.suppliers;
SELECT 'Quotes created:' as info, count(*) as count FROM public.quotes;
SELECT 'Purchase orders created:' as info, count(*) as count FROM public.purchase_orders;
