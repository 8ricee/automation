-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contacts (
  id integer NOT NULL DEFAULT nextval('contacts_id_seq'::regclass),
  customer_id integer NOT NULL,
  name character varying NOT NULL,
  email character varying,
  phone character varying,
  position character varying,
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.customers (
  id integer NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  company character varying,
  status character varying NOT NULL,
  date_added date NOT NULL DEFAULT CURRENT_DATE,
  avatar_seed character varying,
  billing_address text,
  shipping_address text,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employees (
  id integer NOT NULL DEFAULT nextval('employees_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  title character varying,
  department character varying,
  status character varying NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'staff'::user_role,
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invoices (
  id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
  invoice_number character varying NOT NULL UNIQUE,
  customer_id integer,
  order_id integer,
  status character varying NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal bigint NOT NULL,
  vat_rate numeric NOT NULL,
  vat_amount bigint NOT NULL,
  shipping_fee bigint NOT NULL DEFAULT 0,
  total_amount bigint NOT NULL,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_items (
  id integer NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  order_id integer NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit bigint NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  order_number character varying NOT NULL UNIQUE,
  customer_id integer,
  quote_id integer,
  status character varying NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  subtotal bigint NOT NULL,
  vat_rate numeric NOT NULL,
  vat_amount bigint NOT NULL,
  shipping_fee bigint NOT NULL DEFAULT 0,
  total_amount bigint NOT NULL,
  shipping_address text,
  tracking_number character varying,
  shipping_provider character varying,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id)
);
CREATE TABLE public.payments (
  id integer NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
  invoice_id integer NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount_paid bigint NOT NULL,
  payment_method character varying,
  reference_code character varying,
  notes text,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  name character varying NOT NULL,
  status character varying NOT NULL,
  price bigint NOT NULL,
  total_sales integer,
  type USER-DEFINED NOT NULL DEFAULT 'PHYSICAL'::product_type,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  sku character varying UNIQUE,
  stock integer,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.project_members (
  project_id integer NOT NULL,
  employee_id integer NOT NULL,
  role character varying,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT project_members_pkey PRIMARY KEY (employee_id, project_id),
  CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_members_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.projects (
  id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  title character varying NOT NULL,
  description text,
  status character varying NOT NULL,
  progress integer CHECK (progress >= 0 AND progress <= 100),
  customer_id integer,
  start_date date,
  end_date date,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.purchaseorder_items (
  id integer NOT NULL DEFAULT nextval('purchaseorder_items_id_seq'::regclass),
  purchase_order_id integer NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit bigint NOT NULL,
  CONSTRAINT purchaseorder_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchaseorder_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchaseorders(id),
  CONSTRAINT purchaseorder_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.purchaseorders (
  id integer NOT NULL DEFAULT nextval('purchaseorders_id_seq'::regclass),
  po_number character varying NOT NULL UNIQUE,
  supplier_id integer,
  status character varying NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  subtotal bigint NOT NULL,
  vat_rate numeric NOT NULL,
  vat_amount bigint NOT NULL,
  shipping_fee bigint NOT NULL DEFAULT 0,
  total_amount bigint NOT NULL,
  CONSTRAINT purchaseorders_pkey PRIMARY KEY (id),
  CONSTRAINT purchaseorders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id)
);
CREATE TABLE public.quote_items (
  id integer NOT NULL DEFAULT nextval('quote_items_id_seq'::regclass),
  quote_id integer NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit bigint NOT NULL,
  CONSTRAINT quote_items_pkey PRIMARY KEY (id),
  CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id),
  CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.quotes (
  id integer NOT NULL DEFAULT nextval('quotes_id_seq'::regclass),
  quote_number character varying NOT NULL UNIQUE,
  customer_id integer,
  status character varying NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  subtotal bigint NOT NULL,
  vat_rate numeric NOT NULL,
  vat_amount bigint NOT NULL,
  shipping_fee bigint NOT NULL DEFAULT 0,
  total_amount bigint NOT NULL,
  CONSTRAINT quotes_pkey PRIMARY KEY (id),
  CONSTRAINT quotes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.suppliers (
  id integer NOT NULL DEFAULT nextval('suppliers_id_seq'::regclass),
  name character varying NOT NULL,
  contact_person character varying,
  email character varying UNIQUE,
  phone character varying,
  address text,
  tax_code character varying UNIQUE,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id integer NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
  task_code character varying UNIQUE,
  title character varying NOT NULL,
  status character varying NOT NULL,
  priority character varying,
  due_date date,
  assignee_id integer,
  project_id integer,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.employees(id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.timesheets (
  id integer NOT NULL DEFAULT nextval('timesheets_id_seq'::regclass),
  task_id integer,
  employee_id integer NOT NULL,
  hours_worked numeric NOT NULL,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  is_billable boolean DEFAULT true,
  CONSTRAINT timesheets_pkey PRIMARY KEY (id),
  CONSTRAINT timesheets_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT timesheets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.warranties (
  id integer NOT NULL DEFAULT nextval('warranties_id_seq'::regclass),
  order_item_id integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  CONSTRAINT warranties_pkey PRIMARY KEY (id),
  CONSTRAINT warranties_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id)
);