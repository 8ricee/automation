-- Cập nhật permissions cho các roles
-- Admin: Toàn quyền hệ thống
UPDATE "public"."roles" 
SET "permissions" = '["*"]' 
WHERE "name" = 'admin';

-- Director: Toàn quyền quản lý hệ thống (trừ một số chức năng admin)
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "customers:view", "customers:create", "customers:edit", "customers:delete",
  "products:view", "products:create", "products:edit", "products:delete",
  "inventory:view", "inventory:create", "inventory:edit", "inventory:delete", "inventory:adjust",
  "orders:view", "orders:create", "orders:edit", "orders:delete", "orders:approve", "orders:cancel",
  "employees:view", "employees:create", "employees:edit", "employees:delete",
  "projects:view", "projects:create", "projects:edit", "projects:delete", "projects:assign", "projects:approve",
  "tasks:view", "tasks:create", "tasks:edit", "tasks:delete", "tasks:assign", "tasks:complete",
  "quotes:view", "quotes:create", "quotes:edit", "quotes:delete", "quotes:approve", "quotes:send",
  "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:delete", "purchasing:approve",
  "suppliers:view", "suppliers:create", "suppliers:edit", "suppliers:delete",
  "financials:view", "financials:create", "financials:edit", "financials:delete", "financials:approve", "financials:export",
  "analytics:view", "analytics:export",
  "profile:view", "profile:edit",
  "settings:view", "settings:edit"
]' 
WHERE "name" = 'director';

-- Manager: Quản lý dự án và nhân viên
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "customers:view", "customers:create", "customers:edit",
  "products:view", "products:create", "products:edit",
  "inventory:view", "inventory:create", "inventory:edit",
  "orders:view", "orders:create", "orders:edit", "orders:approve",
  "employees:view", "employees:create", "employees:edit",
  "projects:view", "projects:create", "projects:edit", "projects:assign", "projects:approve",
  "tasks:view", "tasks:create", "tasks:edit", "tasks:assign", "tasks:complete",
  "quotes:view", "quotes:create", "quotes:edit", "quotes:approve",
  "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:approve",
  "suppliers:view", "suppliers:create", "suppliers:edit",
  "financials:view", "financials:create", "financials:edit", "financials:approve",
  "analytics:view",
  "profile:view", "profile:edit",
  "settings:view", "settings:edit"
]' 
WHERE "name" = 'manager';

-- Sales: Chăm sóc khách hàng và tạo báo giá
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "customers:view", "customers:create", "customers:edit",
  "products:view",
  "inventory:view",
  "orders:view", "orders:create", "orders:edit",
  "quotes:view", "quotes:create", "quotes:edit", "quotes:send",
  "analytics:view",
  "profile:view", "profile:edit"
]' 
WHERE "name" = 'sales';

-- Accountant: Quản lý tài chính và báo cáo
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "customers:view",
  "products:view",
  "inventory:view",
  "orders:view", "orders:edit", "orders:approve",
  "financials:view", "financials:create", "financials:edit", "financials:approve", "financials:export",
  "analytics:view", "analytics:export",
  "profile:view", "profile:edit"
]' 
WHERE "name" = 'accountant';

-- Engineer: Thực hiện dự án và nhiệm vụ kỹ thuật
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "customers:view",
  "products:view",
  "inventory:view",
  "projects:view", "projects:edit",
  "tasks:view", "tasks:create", "tasks:edit", "tasks:complete",
  "profile:view", "profile:edit"
]' 
WHERE "name" = 'engineer';

-- Purchasing: Quản lý mua sắm và tồn kho
UPDATE "public"."roles" 
SET "permissions" = '[
  "dashboard:view",
  "products:view", "products:create", "products:edit",
  "inventory:view", "inventory:create", "inventory:edit", "inventory:adjust",
  "purchasing:view", "purchasing:create", "purchasing:edit", "purchasing:approve",
  "suppliers:view", "suppliers:create", "suppliers:edit",
  "profile:view", "profile:edit"
]' 
WHERE "name" = 'purchasing';