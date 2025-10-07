--------------------------------------------------------------------------------
-- GIAI ĐOẠN 1: TẠO CÁC HÀM HỖ TRỢ
-- Nền tảng cho việc tự động hóa và bảo mật.
--------------------------------------------------------------------------------

-- Hàm 1: Tự động cập nhật trường 'updated_at'
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Hàm 2: Tự động tạo hồ sơ nhân viên khi có tài khoản mới
-- Khi một kỹ sư hoặc nhân viên mới được cấp tài khoản, hồ sơ của họ sẽ tự động được tạo.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid := 'bf392fa0-f4dc-4cb8-9f7c-b7846bddac6f'; -- UUID của vai trò 'Kỹ sư'
BEGIN
  INSERT INTO public.employees (id, name, email, role_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    default_role_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm 3: Kiểm tra quyền hạn của người dùng (ví dụ: 'projects:view')
CREATE OR REPLACE FUNCTION public.check_permission(permission_to_check text)
RETURNS boolean AS $$
DECLARE
  employee_role_id uuid;
  permissions_list jsonb;
BEGIN
  SELECT role_id INTO employee_role_id FROM public.employees WHERE id = auth.uid();
  SELECT permissions INTO permissions_list FROM public.roles WHERE id = employee_role_id;
  IF (permissions_list ? permission_to_check) OR (permissions_list ? '*') THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--------------------------------------------------------------------------------
-- GIAI ĐOẠN 2: TẠO CẤU TRÚC BẢNG (SCHEMA)
-- Định hình khung xương cho toàn bộ hệ thống.
--------------------------------------------------------------------------------

-- Bảng ROLES: Định nghĩa các vai trò trong công ty (Kế toán, Kỹ sư, Quản lý...).
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng PERMISSIONS: Các quyền hạn chi tiết (hiện tại chưa dùng, để mở rộng sau).
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL UNIQUE,
  resource character varying NOT NULL,
  action character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Bảng CUSTOMERS: Quản lý thông tin khách hàng, chủ đầu tư.
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  email character varying UNIQUE,
  phone character varying,
  company character varying,
  address text,
  city character varying,
  state character varying,
  postal_code character varying,
  country character varying,
  website character varying,
  industry character varying,
  customer_type character varying DEFAULT 'individual'::character varying,
  status character varying DEFAULT 'active'::character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng SUPPLIERS: Quản lý nhà cung cấp thiết bị điện, vật tư.
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  email character varying UNIQUE,
  phone character varying,
  contact_person character varying,
  company character varying,
  address text,
  city character varying,
  state character varying,
  postal_code character varying,
  country character varying,
  website character varying,
  payment_terms character varying,
  status character varying DEFAULT 'active'::character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng EMPLOYEES: Hồ sơ nhân viên, kỹ sư, được liên kết với tài khoản đăng nhập.
CREATE TABLE public.employees (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name character varying,
  email character varying UNIQUE,
  phone character varying,
  position character varying,
  department character varying,
  hire_date date,
  salary numeric,
  employee_id character varying UNIQUE,
  manager_id uuid REFERENCES public.employees(id),
  address text,
  city character varying,
  state character varying,
  postal_code character varying,
  country character varying,
  status character varying DEFAULT 'active'::character varying,
  notes text,
  role_id uuid REFERENCES public.roles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng PRODUCTS: Quản lý vật tư, thiết bị điện (biến tần, PLC, dây cáp, MCCB...).
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  sku character varying UNIQUE,
  description text,
  category character varying,
  brand character varying,
  price numeric NOT NULL DEFAULT 0,
  cost numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  max_stock_level integer DEFAULT 0,
  unit character varying DEFAULT 'piece'::character varying,
  weight numeric,
  dimensions character varying,
  supplier_id uuid REFERENCES public.suppliers(id),
  warranty_period_months integer DEFAULT 12,
  status character varying DEFAULT 'active'::character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng PROJECTS: Quản lý các dự án thi công, lắp đặt, bảo trì hệ thống điện.
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  customer_id uuid REFERENCES public.customers(id),
  project_manager_id uuid REFERENCES public.employees(id),
  start_date date,
  end_date date,
  status character varying DEFAULT 'planning'::character varying,
  priority character varying DEFAULT 'medium'::character varying,
  budget numeric,
  actual_cost numeric DEFAULT 0,
  progress_percentage integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng ORDERS: Đơn hàng bán thiết bị cho khách hàng.
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number character varying NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id),
  order_date date DEFAULT CURRENT_DATE,
  delivery_date date,
  status character varying DEFAULT 'pending'::character varying,
  total_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  shipping_address text,
  billing_address text,
  payment_method character varying,
  payment_status character varying DEFAULT 'pending'::character varying,
  notes text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng QUOTES: Quản lý các báo giá gửi cho khách hàng.
CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_number character varying NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id),
  quote_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  status character varying DEFAULT 'draft'::character varying,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  terms_and_conditions text,
  notes text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng PURCHASE_ORDERS: Đơn hàng nhập vật tư từ nhà cung cấp.
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  po_number character varying NOT NULL UNIQUE,
  supplier_id uuid REFERENCES public.suppliers(id),
  order_date date DEFAULT CURRENT_DATE,
  delivery_date date,
  status character varying DEFAULT 'pending'::character varying,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_terms character varying,
  shipping_address text,
  notes text,
  created_by uuid REFERENCES public.employees(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng TASKS: Các công việc cụ thể trong dự án (khảo sát, vẽ bản vẽ, lắp tủ điện...).
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title character varying NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id),
  assignee_id uuid REFERENCES public.employees(id),
  status character varying DEFAULT 'todo'::character varying,
  priority character varying DEFAULT 'medium'::character varying,
  due_date date,
  estimated_hours numeric,
  actual_hours numeric DEFAULT 0,
  progress_percentage integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bảng ORDER_ITEMS: Chi tiết các sản phẩm trong một đơn hàng bán.
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  total_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Bảng QUOTE_ITEMS: Chi tiết các sản phẩm trong một báo giá.
CREATE TABLE public.quote_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  custom_description text,
  quantity integer NOT NULL DEFAULT 1,
  price_perunit numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  total_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Bảng PURCHASE_ORDER_ITEMS: Chi tiết các sản phẩm trong một đơn hàng nhập.
CREATE TABLE public.purchase_order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  total_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- (Các bảng phụ khác như audit_logs, notifications... đã được lược bỏ cho gọn, bạn có thể thêm lại nếu cần)


--------------------------------------------------------------------------------
-- GIAI ĐOẠN 3: NẠP DỮ LIỆU CỐT LÕI (ROLES & PERMISSIONS)
--------------------------------------------------------------------------------

-- Chèn các vai trò phù hợp với công ty kỹ thuật điện
INSERT INTO "public"."roles" ("id", "name", "description") VALUES
('5f5c7b1b-98c1-44cf-8ea9-f9f9ad65813a', 'admin', 'Quản trị viên - Toàn quyền hệ thống'),
('3a1f2770-0eaf-4652-aefa-3a57ea55f570', 'director', 'Giám đốc - Quản lý chung và phê duyệt cấp cao'),
('6eba8551-a057-4ef4-b64a-17042180fc83', 'manager', 'Quản lý dự án - Điều phối kỹ sư và dự án'),
('bf392fa0-f4dc-4cb8-9f7c-b7846bddac6f', 'engineer', 'Kỹ sư điện - Thực hiện dự án, dịch vụ kỹ thuật'),
('df52099f-de8d-44e0-9a09-919f0c68d874', 'sales', 'Kinh doanh - Chăm sóc khách hàng, làm báo giá'),
('4c64d7ed-140a-4c39-ae08-46a8be744baa', 'purchasing', 'Mua hàng - Quản lý vật tư, tồn kho'),
('a7dff125-058a-40af-8aec-83516e4bf63e', 'accountant', 'Kế toán - Quản lý tài chính, công nợ');

-- Cập nhật quyền hạn chi tiết cho từng vai trò
UPDATE "public"."roles" SET "permissions" = '["*"]' WHERE "name" = 'admin';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "customers:view", "customers:create", "customers:edit", "customers:delete", "products:view", "products:create", "products:edit", "products:delete", "inventory:view", "inventory:create", "inventory:edit", "inventory:delete", "inventory:adjust", "orders:view", "orders:create", "orders:edit", "orders:delete", "orders:approve", "orders:cancel", "employees:view", "employees:create", "employees:edit", "employees:delete", "projects:view", "projects:create", "projects:edit", "projects:delete", "projects:assign", "projects:approve", "tasks:view", "tasks:create", "tasks:edit", "tasks:delete", "tasks:assign", "tasks:complete", "quotes:view", "quotes:create", "quotes:edit", "quotes:delete", "quotes:approve", "quotes:send", "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:delete", "purchasing:approve", "suppliers:view", "suppliers:create", "suppliers:edit", "suppliers:delete", "financials:view", "financials:create", "financials:edit", "financials:delete", "financials:approve", "financials:export", "analytics:view", "analytics:export", "profile:view", "profile:edit", "settings:view", "settings:edit"]' WHERE "name" = 'director';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "customers:view", "customers:create", "customers:edit", "products:view", "products:create", "products:edit", "inventory:view", "inventory:create", "inventory:edit", "orders:view", "orders:create", "orders:edit", "orders:approve", "employees:view", "employees:create", "employees:edit", "projects:view", "projects:create", "projects:edit", "projects:assign", "projects:approve", "tasks:view", "tasks:create", "tasks:edit", "tasks:assign", "tasks:complete", "quotes:view", "quotes:create", "quotes:edit", "quotes:approve", "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:approve", "suppliers:view", "suppliers:create", "suppliers:edit", "financials:view", "financials:create", "financials:edit", "financials:approve", "analytics:view", "profile:view", "profile:edit", "settings:view", "settings:edit"]' WHERE "name" = 'manager';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "customers:view", "customers:create", "customers:edit", "products:view", "inventory:view", "orders:view", "orders:create", "orders:edit", "quotes:view", "quotes:create", "quotes:edit", "quotes:send", "analytics:view", "profile:view", "profile:edit"]' WHERE "name" = 'sales';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "customers:view", "products:view", "inventory:view", "orders:view", "orders:edit", "orders:approve", "financials:view", "financials:create", "financials:edit", "financials:approve", "financials:export", "analytics:view", "analytics:export", "profile:view", "profile:edit"]' WHERE "name" = 'accountant';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "customers:view", "products:view", "inventory:view", "projects:view", "projects:edit", "tasks:view", "tasks:create", "tasks:edit", "tasks:complete", "profile:view", "profile:edit"]' WHERE "name" = 'engineer';
UPDATE "public"."roles" SET "permissions" = '["dashboard:view", "products:view", "products:create", "products:edit", "inventory:view", "inventory:create", "inventory:edit", "inventory:adjust", "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:approve", "suppliers:view", "suppliers:create", "suppliers:edit", "profile:view", "profile:edit"]' WHERE "name" = 'purchasing';


--------------------------------------------------------------------------------
-- GIAI ĐOẠN 4: TẠO CÁC TRIGGERS
--------------------------------------------------------------------------------

-- Trigger 1: Kích hoạt khi có user mới
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Tự động cập nhật 'updated_at' cho các bảng chính
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


--------------------------------------------------------------------------------
-- GIAI ĐOẠN 5: KÍCH HOẠT BẢO MẬT (RLS)
--------------------------------------------------------------------------------

-- Bật RLS cho các bảng quan trọng
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Tạo các chính sách bảo mật

-- Chính sách cho Employees: Nhân viên chỉ có thể xem và sửa hồ sơ của chính mình.
CREATE POLICY "Employees can access their own profile" ON public.employees FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Chính sách cho Customers: Chỉ người có quyền mới được truy cập.
CREATE POLICY "Users can access customers based on permissions" ON public.customers FOR ALL
  USING (check_permission('customers:view'))
  WITH CHECK (check_permission('customers:create') OR check_permission('customers:edit'));

-- Chính sách cho Projects: Quản lý dự án chỉ thấy dự án của mình, cấp cao hơn thấy tất cả.
CREATE POLICY "Users can view projects they manage or have permission for" ON public.projects FOR SELECT
  USING (project_manager_id = auth.uid() OR check_permission('projects:view'));

-- Chính sách cho Tasks: Kỹ sư thấy task của mình, quản lý thấy task của team mình.
CREATE POLICY "Users can view tasks assigned to them or their team" ON public.tasks FOR SELECT
  USING (assignee_id = auth.uid() OR assignee_id IN (SELECT id FROM public.employees WHERE manager_id = auth.uid()));

-- Chính sách cho Products: Kỹ sư, kinh doanh, mua hàng đều có thể xem vật tư.
CREATE POLICY "Relevant roles can view products" ON public.products FOR SELECT
  USING (check_permission('products:view'));