--------------------------------------------------------------------------------
-- BỔ SUNG ROW LEVEL SECURITY POLICIES
-- Các policies bổ sung để đảm bảo bảo mật toàn diện
--------------------------------------------------------------------------------

-- Bật RLS cho các bảng còn lại
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Chính sách cho SUPPLIERS: Chỉ người có quyền mới được truy cập
CREATE POLICY "Users can access suppliers based on permissions" ON public.suppliers FOR ALL
  USING (check_permission('suppliers:view'))
  WITH CHECK (check_permission('suppliers:create') OR check_permission('suppliers:edit'));

-- Chính sách cho PURCHASE_ORDERS: Chỉ người có quyền mới được truy cập
CREATE POLICY "Users can access purchase orders based on permissions" ON public.purchase_orders FOR ALL
  USING (check_permission('purchasing:view'))
  WITH CHECK (check_permission('purchasing:create') OR check_permission('purchasing:edit'));

-- Chính sách cho ORDER_ITEMS: Chỉ người có quyền mới được truy cập
CREATE POLICY "Users can access order items based on permissions" ON public.order_items FOR ALL
  USING (check_permission('orders:view'))
  WITH CHECK (check_permission('orders:create') OR check_permission('orders:edit'));

-- Chính sách cho QUOTE_ITEMS: Chỉ người có quyền mới được truy cập
CREATE POLICY "Users can access quote items based on permissions" ON public.quote_items FOR ALL
  USING (check_permission('quotes:view'))
  WITH CHECK (check_permission('quotes:create') OR check_permission('quotes:edit'));

-- Chính sách cho PURCHASE_ORDER_ITEMS: Chỉ người có quyền mới được truy cập
CREATE POLICY "Users can access purchase order items based on permissions" ON public.purchase_order_items FOR ALL
  USING (check_permission('purchasing:view'))
  WITH CHECK (check_permission('purchasing:create') OR check_permission('purchasing:edit'));

-- Bổ sung chính sách cho ORDERS
CREATE POLICY "Users can access orders based on permissions" ON public.orders FOR ALL
  USING (check_permission('orders:view'))
  WITH CHECK (check_permission('orders:create') OR check_permission('orders:edit'));

-- Bổ sung chính sách cho QUOTES
CREATE POLICY "Users can access quotes based on permissions" ON public.quotes FOR ALL
  USING (check_permission('quotes:view'))
  WITH CHECK (check_permission('quotes:create') OR check_permission('quotes:edit'));

-- Bổ sung chính sách cho PRODUCTS
CREATE POLICY "Users can access products based on permissions" ON public.products FOR ALL
  USING (check_permission('products:view'))
  WITH CHECK (check_permission('products:create') OR check_permission('products:edit'));

-- Chính sách cho PROJECTS (bổ sung)
CREATE POLICY "Users can edit projects based on permissions" ON public.projects FOR UPDATE
  USING (check_permission('projects:edit'));

CREATE POLICY "Users can create projects based on permissions" ON public.projects FOR INSERT
  WITH CHECK (check_permission('projects:create'));

CREATE POLICY "Users can delete projects based on permissions" ON public.projects FOR DELETE
  USING (check_permission('projects:delete'));

-- Chính sách cho TASKS (bổ sung)
CREATE POLICY "Users can edit tasks based on permissions" ON public.tasks FOR UPDATE
  USING (check_permission('tasks:edit'));

CREATE POLICY "Users can create tasks based on permissions" ON public.tasks FOR INSERT
  WITH CHECK (check_permission('tasks:create'));

CREATE POLICY "Users can delete tasks based on permissions" ON public.tasks FOR DELETE
  USING (check_permission('tasks:delete'));

-- Chính sách cho EMPLOYEES (bổ sung)
CREATE POLICY "Users can edit employees based on permissions" ON public.employees FOR UPDATE
  USING (check_permission('employees:edit'));

CREATE POLICY "Users can create employees based on permissions" ON public.employees FOR INSERT
  WITH CHECK (check_permission('employees:create'));

CREATE POLICY "Users can delete employees based on permissions" ON public.employees FOR DELETE
  USING (check_permission('employees:delete'));

-- Chính sách cho CUSTOMERS (bổ sung)
CREATE POLICY "Users can edit customers based on permissions" ON public.customers FOR UPDATE
  USING (check_permission('customers:edit'));

CREATE POLICY "Users can create customers based on permissions" ON public.customers FOR INSERT
  WITH CHECK (check_permission('customers:create'));

CREATE POLICY "Users can delete customers based on permissions" ON public.customers FOR DELETE
  USING (check_permission('customers:delete'));

--------------------------------------------------------------------------------
-- TẠO CÁC FUNCTION HỖ TRỢ BẢO MẬT
--------------------------------------------------------------------------------

-- Function để kiểm tra quyền truy cập resource cụ thể
CREATE OR REPLACE FUNCTION public.check_resource_permission(
  resource_type text,
  action text
)
RETURNS boolean AS $$
DECLARE
  permission_to_check text;
BEGIN
  permission_to_check := resource_type || ':' || action;
  RETURN check_permission(permission_to_check);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy thông tin user hiện tại
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  role_id uuid,
  role_name text,
  permissions jsonb,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as user_id,
    e.email as user_email,
    e.role_id,
    r.name as role_name,
    r.permissions,
    e.is_active
  FROM public.employees e
  LEFT JOIN public.roles r ON e.role_id = r.id
  WHERE e.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để kiểm tra user có phải là admin không
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role_name text;
BEGIN
  SELECT r.name INTO user_role_name
  FROM public.employees e
  LEFT JOIN public.roles r ON e.role_id = r.id
  WHERE e.id = auth.uid();
  
  RETURN user_role_name = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để kiểm tra user có phải là manager không
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean AS $$
DECLARE
  user_role_name text;
BEGIN
  SELECT r.name INTO user_role_name
  FROM public.employees e
  LEFT JOIN public.roles r ON e.role_id = r.id
  WHERE e.id = auth.uid();
  
  RETURN user_role_name IN ('admin', 'director', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- TẠO CÁC POLICY NÂNG CAO
--------------------------------------------------------------------------------

-- Policy cho việc quản lý roles (chỉ admin mới được)
CREATE POLICY "Only admins can manage roles" ON public.roles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy cho việc quản lý permissions (chỉ admin mới được)
CREATE POLICY "Only admins can manage permissions" ON public.permissions FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy cho việc xem thông tin nhân viên khác (manager trở lên)
CREATE POLICY "Managers can view all employees" ON public.employees FOR SELECT
  USING (is_manager() OR auth.uid() = id);

-- Policy cho việc chỉnh sửa thông tin nhân viên khác (manager trở lên)
CREATE POLICY "Managers can edit employees" ON public.employees FOR UPDATE
  USING (is_manager() OR auth.uid() = id);

-- Policy cho việc tạo nhân viên mới (manager trở lên)
CREATE POLICY "Managers can create employees" ON public.employees FOR INSERT
  WITH CHECK (is_manager());

-- Policy cho việc xóa nhân viên (chỉ admin)
CREATE POLICY "Only admins can delete employees" ON public.employees FOR DELETE
  USING (is_admin());

--------------------------------------------------------------------------------
-- TẠO AUDIT LOG TABLE VÀ POLICIES
--------------------------------------------------------------------------------

-- Tạo bảng audit_logs nếu chưa có
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now()
);

-- Bật RLS cho audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy cho audit_logs (chỉ admin và manager mới được xem)
CREATE POLICY "Managers can view audit logs" ON public.audit_logs FOR SELECT
  USING (is_manager());

-- Policy cho việc insert audit logs (tất cả user đã đăng nhập)
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

--------------------------------------------------------------------------------
-- TẠO TRIGGERS CHO AUDIT LOGGING
--------------------------------------------------------------------------------

-- Function để tạo audit log
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  action_type text;
  old_data jsonb;
  new_data jsonb;
BEGIN
  -- Xác định loại action
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    employee_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    timestamp
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo triggers cho các bảng quan trọng
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.create_audit_log();

CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.create_audit_log();

CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.create_audit_log();

CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.create_audit_log();

CREATE TRIGGER audit_employees_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE PROCEDURE public.create_audit_log();

--------------------------------------------------------------------------------
-- TẠO VIEWS CHO BÁO CÁO VÀ PHÂN TÍCH
--------------------------------------------------------------------------------

-- View để xem thông tin nhân viên với role
CREATE OR REPLACE VIEW public.employee_roles_view AS
SELECT 
  e.id,
  e.name,
  e.email,
  e.position,
  e.department,
  e.is_active,
  r.name as role_name,
  r.description as role_description,
  r.permissions
FROM public.employees e
LEFT JOIN public.roles r ON e.role_id = r.id;

-- Policy cho view
CREATE POLICY "Users can view employee roles based on permissions" ON public.employee_roles_view FOR SELECT
  USING (check_permission('employees:view'));

-- View để xem thống kê permissions
CREATE OR REPLACE VIEW public.permission_stats_view AS
SELECT 
  r.name as role_name,
  COUNT(e.id) as employee_count,
  r.permissions
FROM public.roles r
LEFT JOIN public.employees e ON r.id = e.role_id AND e.is_active = true
GROUP BY r.id, r.name, r.permissions;

-- Policy cho view thống kê (chỉ admin và manager)
CREATE POLICY "Managers can view permission stats" ON public.permission_stats_view FOR SELECT
  USING (is_manager());
