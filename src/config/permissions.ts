// Cấu hình phân quyền dựa trên database
export interface RoleConfig {
  id: string
  name: string
  description: string
  permissions: string[]
  allowedPages: string[]
  sidebarItems: SidebarItem[]
}

export interface SidebarItem {
  title: string
  href: string
  icon: string
  permissions?: string[]
}

// Mapping từ database permissions sang UI permissions
export const PERMISSION_MAPPING: Record<string, string> = {
  // Dashboard permissions
  'dashboard.read': 'dashboard:view',
  
  // Customer permissions
  'customers.create': 'customers:create',
  'customers.read': 'customers:view',
  'customers.update': 'customers:edit',
  'customers.delete': 'customers:delete',
  
  // Product permissions
  'products.create': 'products:create',
  'products.read': 'products:view',
  'products.update': 'products:edit',
  'products.delete': 'products:delete',
  
  // Order permissions
  'orders.create': 'orders:create',
  'orders.read': 'orders:view',
  'orders.update': 'orders:edit',
  'orders.delete': 'orders:delete',
  'orders.approve': 'orders:approve',
  
  // Employee permissions
  'employees.create': 'employees:create',
  'employees.read': 'employees:view',
  'employees.update': 'employees:edit',
  'employees.delete': 'employees:delete',
  
  // Project permissions
  'projects.create': 'projects:create',
  'projects.read': 'projects:view',
  'projects.update': 'projects:edit',
  'projects.delete': 'projects:delete',
  'projects.assign': 'projects:assign',
  
  // Task permissions
  'tasks.create': 'tasks:create',
  'tasks.read': 'tasks:view',
  'tasks.update': 'tasks:edit',
  'tasks.delete': 'tasks:delete',
  'tasks.assign': 'tasks:assign',
  'tasks.complete': 'tasks:complete',
  
  // Quote permissions
  'quotes.create': 'quotes:create',
  'quotes.read': 'quotes:view',
  'quotes.update': 'quotes:edit',
  'quotes.delete': 'quotes:delete',
  'quotes.approve': 'quotes:approve',
  
  // Purchasing permissions
  'purchasing.create': 'purchasing:create',
  'purchasing.read': 'purchasing:view',
  'purchasing.update': 'purchasing:edit',
  'purchasing.delete': 'purchasing:delete',
  'purchasing.approve': 'purchasing:approve',
  
  // Financial permissions
  'financials.create': 'financials:create',
  'financials.read': 'financials:view',
  'financials.update': 'financials:edit',
  'financials.delete': 'financials:delete',
  'financials.approve': 'financials:approve',
  
  // Supplier permissions
  'suppliers.create': 'suppliers:create',
  'suppliers.read': 'suppliers:view',
  'suppliers.update': 'suppliers:edit',
  'suppliers.delete': 'suppliers:delete',
  
  // Analytics permissions
  'analytics.read': 'analytics:view',
  
  // Profile permissions
  'profile.read': 'profile:view',
  'profile.update': 'profile:edit',
  
  // Settings permissions
  'settings.read': 'settings:view',
  'settings.update': 'settings:edit',
  
  // Role management permissions
  'roles.manage': 'roles:manage'
}

// Mapping từ database roles sang UI roles
export const ROLE_MAPPING: Record<string, string> = {
  'admin': 'admin',
  'director': 'director',
  'manager': 'manager',
  'sales': 'sales',
  'accountant': 'accountant',
  'engineer': 'engineer',
  'purchasing': 'purchasing'
}

// Sidebar items cho từng role (dựa trên database roles)
export const ROLE_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  admin: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Đơn hàng', href: '/orders', icon: 'ShoppingCart' },
    { title: 'Nhân viên', href: '/employees', icon: 'UserCheck' },
    { title: 'Dự án', href: '/projects', icon: 'FolderOpen' },
    { title: 'Nhiệm vụ', href: '/tasks', icon: 'CheckSquare' },
    { title: 'Báo giá', href: '/quotes', icon: 'FileText' },
    { title: 'Mua sắm', href: '/purchasing', icon: 'ShoppingBag' },
    { title: 'Nhà cung cấp', href: '/suppliers', icon: 'Truck' },
    { title: 'Tài chính', href: '/financials', icon: 'DollarSign' },
    { title: 'Phân tích', href: '/analytics', icon: 'BarChart3' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' },
    { title: 'Cài đặt', href: '/settings', icon: 'Settings' },
    { title: 'Quản lý Roles', href: '/role-management', icon: 'Shield' }
  ],
  director: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Đơn hàng', href: '/orders', icon: 'ShoppingCart' },
    { title: 'Nhân viên', href: '/employees', icon: 'UserCheck' },
    { title: 'Dự án', href: '/projects', icon: 'FolderOpen' },
    { title: 'Nhiệm vụ', href: '/tasks', icon: 'CheckSquare' },
    { title: 'Báo giá', href: '/quotes', icon: 'FileText' },
    { title: 'Mua sắm', href: '/purchasing', icon: 'ShoppingBag' },
    { title: 'Tài chính', href: '/financials', icon: 'DollarSign' },
    { title: 'Phân tích', href: '/analytics', icon: 'BarChart3' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' },
    { title: 'Cài đặt', href: '/settings', icon: 'Settings' },
    { title: 'Quản lý Roles', href: '/role-management', icon: 'Shield' }
  ],
  manager: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Đơn hàng', href: '/orders', icon: 'ShoppingCart' },
    { title: 'Nhân viên', href: '/employees', icon: 'UserCheck' },
    { title: 'Dự án', href: '/projects', icon: 'FolderOpen' },
    { title: 'Nhiệm vụ', href: '/tasks', icon: 'CheckSquare' },
    { title: 'Báo giá', href: '/quotes', icon: 'FileText' },
    { title: 'Mua sắm', href: '/purchasing', icon: 'ShoppingBag' },
    { title: 'Tài chính', href: '/financials', icon: 'DollarSign' },
    { title: 'Phân tích', href: '/analytics', icon: 'BarChart3' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' },
    { title: 'Cài đặt', href: '/settings', icon: 'Settings' }
  ],
  sales: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Đơn hàng', href: '/orders', icon: 'ShoppingCart' },
    { title: 'Báo giá', href: '/quotes', icon: 'FileText' },
    { title: 'Phân tích', href: '/analytics', icon: 'BarChart3' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' }
  ],
  accountant: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Đơn hàng', href: '/orders', icon: 'ShoppingCart' },
    { title: 'Tài chính', href: '/financials', icon: 'DollarSign' },
    { title: 'Phân tích', href: '/analytics', icon: 'BarChart3' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' }
  ],
  engineer: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Khách hàng', href: '/customers', icon: 'Users' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Dự án', href: '/projects', icon: 'FolderOpen' },
    { title: 'Nhiệm vụ', href: '/tasks', icon: 'CheckSquare' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' }
  ],
  purchasing: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Sản phẩm', href: '/products', icon: 'Package' },
    { title: 'Tồn kho', href: '/inventory', icon: 'Package2' },
    { title: 'Mua sắm', href: '/purchasing', icon: 'ShoppingBag' },
    { title: 'Nhà cung cấp', href: '/suppliers', icon: 'Truck' },
    { title: 'Hồ sơ', href: '/profile', icon: 'User' }
  ]
}

// Allowed pages cho từng role
export const ROLE_ALLOWED_PAGES: Record<string, string[]> = {
  admin: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/orders',
    '/employees',
    '/projects',
    '/tasks',
    '/quotes',
    '/purchasing',
    '/financials',
    '/analytics',
    '/profile',
    '/settings',
    '/role-management'
  ],
  director: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/orders',
    '/employees',
    '/projects',
    '/tasks',
    '/quotes',
    '/purchasing',
    '/financials',
    '/analytics',
    '/profile',
    '/settings',
    '/role-management'
  ],
  manager: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/orders',
    '/employees',
    '/projects',
    '/tasks',
    '/quotes',
    '/purchasing',
    '/financials',
    '/analytics',
    '/profile',
    '/settings'
  ],
  sales: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/orders',
    '/quotes',
    '/analytics',
    '/profile'
  ],
  accountant: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/orders',
    '/financials',
    '/analytics',
    '/profile'
  ],
  engineer: [
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/projects',
    '/tasks',
    '/profile'
  ],
  purchasing: [
    '/dashboard',
    '/products',
    '/inventory',
    '/purchasing',
    '/suppliers',
    '/profile'
  ]
}

// Utility functions để làm việc với database permissions
export function mapDatabasePermissionToUI(dbPermission: string): string {
  return PERMISSION_MAPPING[dbPermission] || dbPermission
}

export function mapDatabaseRoleToUI(dbRole: string): string {
  return ROLE_MAPPING[dbRole] || dbRole
}

export function getRoleConfigFromDatabase(roleName: string, permissions: string[]): RoleConfig | null {
  const uiRole = mapDatabaseRoleToUI(roleName)
  const sidebarItems = ROLE_SIDEBAR_ITEMS[roleName] || []
  const allowedPages = ROLE_ALLOWED_PAGES[roleName] || []
  
  if (!sidebarItems.length) return null
  
  return {
    id: '', // Sẽ được set từ database
    name: uiRole,
    description: getRoleDescription(roleName),
    permissions: permissions.map(mapDatabasePermissionToUI),
    allowedPages,
    sidebarItems
  }
}

function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    'admin': 'Quản trị viên - Toàn quyền hệ thống',
    'director': 'Giám đốc - Toàn quyền hệ thống',
    'manager': 'Quản lý - Quản lý dự án và nhân viên',
    'sales': 'Nhân viên bán hàng - Chăm sóc khách hàng và tạo báo giá',
    'accountant': 'Kế toán - Quản lý tài chính và báo cáo',
    'engineer': 'Kỹ sư - Thực hiện dự án và nhiệm vụ kỹ thuật',
    'purchasing': 'Nhân viên mua sắm - Quản lý mua sắm và tồn kho'
  }
  return descriptions[roleName] || 'Nhân viên công ty'
}

// Legacy support - giữ lại để không break existing code
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_EDIT: 'orders:edit',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_APPROVE: 'orders:approve',
  EMPLOYEES_VIEW: 'employees:view',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_EDIT: 'employees:edit',
  EMPLOYEES_DELETE: 'employees:delete',
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  TASKS_VIEW: 'tasks:view',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',
  QUOTES_VIEW: 'quotes:view',
  QUOTES_CREATE: 'quotes:create',
  QUOTES_EDIT: 'quotes:edit',
  QUOTES_DELETE: 'quotes:delete',
  PURCHASING_VIEW: 'purchasing:view',
  PURCHASING_CREATE: 'purchasing:create',
  PURCHASING_EDIT: 'purchasing:edit',
  PURCHASING_DELETE: 'purchasing:delete',
  FINANCIALS_VIEW: 'financials:view',
  FINANCIALS_CREATE: 'financials:create',
  FINANCIALS_EDIT: 'financials:edit',
  FINANCIALS_DELETE: 'financials:delete',
  ANALYTICS_VIEW: 'analytics:view',
  PROFILE_VIEW: 'profile:view',
  PROFILE_EDIT: 'profile:edit',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGEMENT: 'users:manage',
  ROLE_MANAGEMENT: 'roles:manage'
} as const

// Legacy functions
export function getRoleConfig(roleName: string): RoleConfig | null {
  // Fallback cho legacy code
  return null
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}