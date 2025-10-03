-- COMPLETE BUSINESS MANAGEMENT SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor to get full database structure

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS warranties CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS purchaseorder_items CASCADE;
DROP TABLE IF EXISTS purchaseorders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;

-- Create Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'viewer');
CREATE TYPE product_type AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE');
CREATE TYPE order_type AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar_seed TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  tax_code TEXT UNIQUE
);

-- Create suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  tax_code TEXT UNIQUE
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  price BIGINT NOT NULL,
  cost BIGINT DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  type product_type NOT NULL DEFAULT 'PHYSICAL',
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  warranty_period_months INTEGER DEFAULT 12
);

-- Create employees table  
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  title TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  role user_role NOT NULL DEFAULT 'staff',
  hourly_rate BIGINT DEFAULT 0,
  hire_date DATE DEFAULT CURRENT_DATE
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  budget BIGINT DEFAULT 0,
  project_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  billable_rate BIGINT DEFAULT 0
);

-- Create quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  valid_for_days INTEGER DEFAULT 30,
  subtotal BIGINT NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0.1,
  vat_amount BIGINT NOT NULL DEFAULT 0,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  notes TEXT
);

-- Create quote_items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  custom_description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_perunit BIGINT NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  total_price BIGINT DEFAULT 0
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  status order_type NOT NULL DEFAULT 'pending',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_delivery_date DATE,
  subtotal BIGINT NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0.1,
  vat_amount BIGINT NOT NULL DEFAULT 0,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  shipping_address TEXT,
  tracking_number TEXT,
  shipping_provider TEXT,
  notes TEXT
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  custom_description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_perunit BIGINT NOT NULL,
  total_price BIGINT DEFAULT 0
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  subtotal BIGINT NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0.1,
  vat_amount BIGINT NOT NULL DEFAULT 0,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  paid_amount BIGINT DEFAULT 0,
  notes TEXT
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_paid BIGINT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check')),
  reference_code TEXT,
  notes TEXT,
  payment_status payment_status DEFAULT 'pending'
);

-- Create purchaseorders table
CREATE TABLE purchaseorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  subtotal BIGINT NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0.1,
  vat_amount BIGINT NOT NULL DEFAULT 0,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  notes TEXT
);

-- Create purchaseorder_items table
CREATE TABLE purchaseorder_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  purchase_order_id UUID NOT NULL REFERENCES purchaseorders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  supplier_product_code TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_perUnit BIGINT NOT NULL,
  total_price BIGINT DEFAULT 0
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  task_code TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assignee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  estimated_hours INTEGER DEFAULT 0,
  completed_hours INTEGER DEFAULT 0,
  billable BOOLEAN DEFAULT true
);

-- Create timesheets table
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stworzone TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  hours_worked NUMERIC NOT NULL CHECK (hours_worked > 0),
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  billing_rate BIGINT DEFAULT 0
);

-- Create warranties table
CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void')),
  notes TEXT,
  claim_count INTEGER DEFAULT 0
);

-- Insert Sample Data
INSERT INTO customers (id, name, email, company, status) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Công ty TNHH ABC', 'info@abc.com', 'ABC Corp', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Nguyễn Văn Minh', 'minh@xyz.com', 'XYZ Ltd', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Doanh nghiệp DEF', 'contact@def.com', 'DEF Company', 'pending');

INSERT INTO suppliers (id, name, contact_person, email, phone) VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Supplier A', 'John Doe', 'contact@suppliera.com', '+84 123 456 789'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Supplier B', 'Jane Smith', 'info@supplierb.com', '+84 987 654 321');

INSERT INTO products (id, name, description, price, cost, sku, supplier_id) VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', 'Product Alpha', 'High-quality product Alpha', 10000000, 7000000, 'PROD-001', '770e8400-e29b-41d4-a716-446655440001'),
  ('880e8400-e29b-41d4-a716-446655440002', 'Product Beta', 'Digital product Beta', 5000000, 3000000, 'PROD-002', '770e8400-e29b-41d4-a716-446655440002'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Service Gamma', 'Consulting service', 15000000, 5000000, 'SERV-001', null);

INSERT INTO employees (id, name, email, title, department, role) VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'Trần Văn Admin', 'admin@company.com', 'System Administrator', 'IT', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440002', 'Nguyen Thi Manager', 'manager@company.com', 'Sales Manager', 'Sales', 'manager'),
  ('990e8400-e29b-41d4-a716-446655440003', 'Le Van Staff', 'staff@company.com', 'Sales Staff', 'Sales', 'staff');

-- Enable Row Level Security (temporarily disabled for development)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchaseorders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchaseorder_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranties DISABLE ROW LEVEL SECURITY;

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

SELECT 'Business schema setup completed successfully!' as result;
