'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { hasPermission } from '@/utils/auth-utils';

/**
 * Hook để kiểm tra permissions của user hiện tại
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Kiểm tra permission cụ thể
   */
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user, permission);
  };

  /**
   * Kiểm tra quyền quản lý customers
   */
  const canManageCustomers = (): boolean => {
    return checkPermission('customers:create') || checkPermission('customers:update') || checkPermission('customers:delete');
  };

  const canCreateCustomers = (): boolean => checkPermission('customers:create');
  const canEditCustomers = (): boolean => checkPermission('customers:update');
  const canDeleteCustomers = (): boolean => checkPermission('customers:delete');
  const canViewCustomers = (): boolean => checkPermission('customers:read');

  /**
   * Kiểm tra quyền quản lý products
   */
  const canManageProducts = (): boolean => {
    return checkPermission('products:create') || checkPermission('products:update') || checkPermission('products:delete');
  };

  const canCreateProducts = (): boolean => checkPermission('products:create');
  const canEditProducts = (): boolean => checkPermission('products:update');
  const canDeleteProducts = (): boolean => checkPermission('products:delete');
  const canViewProducts = (): boolean => checkPermission('products:read');

  /**
   * Kiểm tra quyền quản lý orders
   */
  const canManageOrders = (): boolean => {
    return checkPermission('orders:create') || checkPermission('orders:update') || checkPermission('orders:delete');
  };

  const canCreateOrders = (): boolean => checkPermission('orders:create');
  const canEditOrders = (): boolean => checkPermission('orders:update');
  const canDeleteOrders = (): boolean => checkPermission('orders:delete');
  const canViewOrders = (): boolean => checkPermission('orders:read');

  /**
   * Kiểm tra quyền quản lý employees
   */
  const canManageEmployees = (): boolean => {
    return checkPermission('employees:create') || checkPermission('employees:update') || checkPermission('employees:delete');
  };

  const canCreateEmployees = (): boolean => checkPermission('employees:create');
  const canEditEmployees = (): boolean => checkPermission('employees:update');
  const canDeleteEmployees = (): boolean => checkPermission('employees:delete');
  const canViewEmployees = (): boolean => checkPermission('employees:read');

  /**
   * Kiểm tra quyền quản lý projects
   */
  const canManageProjects = (): boolean => {
    return checkPermission('projects:create') || checkPermission('projects:update') || checkPermission('projects:delete');
  };

  const canCreateProjects = (): boolean => checkPermission('projects:create');
  const canEditProjects = (): boolean => checkPermission('projects:update');
  const canDeleteProjects = (): boolean => checkPermission('projects:delete');
  const canViewProjects = (): boolean => checkPermission('projects:read');

  /**
   * Kiểm tra quyền quản lý tasks
   */
  const canManageTasks = (): boolean => {
    return checkPermission('tasks:create') || checkPermission('tasks:update') || checkPermission('tasks:delete');
  };

  const canCreateTasks = (): boolean => checkPermission('tasks:create');
  const canEditTasks = (): boolean => checkPermission('tasks:update');
  const canDeleteTasks = (): boolean => checkPermission('tasks:delete');
  const canViewTasks = (): boolean => checkPermission('tasks:read');

  /**
   * Kiểm tra quyền quản lý quotes
   */
  const canManageQuotes = (): boolean => {
    return checkPermission('quotes:create') || checkPermission('quotes:update') || checkPermission('quotes:delete');
  };

  const canCreateQuotes = (): boolean => checkPermission('quotes:create');
  const canEditQuotes = (): boolean => checkPermission('quotes:update');
  const canDeleteQuotes = (): boolean => checkPermission('quotes:delete');
  const canViewQuotes = (): boolean => checkPermission('quotes:read');

  /**
   * Kiểm tra quyền quản lý purchasing
   */
  const canManagePurchasing = (): boolean => {
    return checkPermission('purchasing:create') || checkPermission('purchasing:update') || checkPermission('purchasing:delete');
  };

  const canCreatePurchasing = (): boolean => checkPermission('purchasing:create');
  const canEditPurchasing = (): boolean => checkPermission('purchasing:update');
  const canDeletePurchasing = (): boolean => checkPermission('purchasing:delete');
  const canViewPurchasing = (): boolean => checkPermission('purchasing:read');

  /**
   * Kiểm tra quyền quản lý suppliers
   */
  const canManageSuppliers = (): boolean => {
    return checkPermission('suppliers:create') || checkPermission('suppliers:update') || checkPermission('suppliers:delete');
  };

  const canCreateSuppliers = (): boolean => checkPermission('suppliers:create');
  const canEditSuppliers = (): boolean => checkPermission('suppliers:update');
  const canDeleteSuppliers = (): boolean => checkPermission('suppliers:delete');
  const canViewSuppliers = (): boolean => checkPermission('suppliers:read');

  /**
   * Kiểm tra quyền quản lý financials
   */
  const canManageFinancials = (): boolean => {
    return checkPermission('financials:create') || checkPermission('financials:update') || checkPermission('financials:delete');
  };

  const canCreateFinancials = (): boolean => checkPermission('financials:create');
  const canEditFinancials = (): boolean => checkPermission('financials:update');
  const canDeleteFinancials = (): boolean => checkPermission('financials:delete');
  const canViewFinancials = (): boolean => checkPermission('financials:read');

  /**
   * Kiểm tra quyền admin
   */
  const isAdmin = (): boolean => {
    return checkPermission('*') || user?.role_name === 'admin';
  };

  /**
   * Kiểm tra quyền quản lý roles
   */
  const canManageRoles = (): boolean => {
    return checkPermission('roles:manage') || isAdmin();
  };

  return {
    // Generic permission checker
    hasPermission: checkPermission,
    
    // Customer permissions
    canManageCustomers,
    canCreateCustomers,
    canEditCustomers,
    canDeleteCustomers,
    canViewCustomers,
    
    // Product permissions
    canManageProducts,
    canCreateProducts,
    canEditProducts,
    canDeleteProducts,
    canViewProducts,
    
    // Order permissions
    canManageOrders,
    canCreateOrders,
    canEditOrders,
    canDeleteOrders,
    canViewOrders,
    
    // Employee permissions
    canManageEmployees,
    canCreateEmployees,
    canEditEmployees,
    canDeleteEmployees,
    canViewEmployees,
    
    // Project permissions
    canManageProjects,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canViewProjects,
    
    // Task permissions
    canManageTasks,
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canViewTasks,
    
    // Quote permissions
    canManageQuotes,
    canCreateQuotes,
    canEditQuotes,
    canDeleteQuotes,
    canViewQuotes,
    
    // Purchasing permissions
    canManagePurchasing,
    canCreatePurchasing,
    canEditPurchasing,
    canDeletePurchasing,
    canViewPurchasing,
    
    // Supplier permissions
    canManageSuppliers,
    canCreateSuppliers,
    canEditSuppliers,
    canDeleteSuppliers,
    canViewSuppliers,
    
    // Financial permissions
    canManageFinancials,
    canCreateFinancials,
    canEditFinancials,
    canDeleteFinancials,
    canViewFinancials,
    
    // System permissions
    isAdmin,
    canManageRoles,
  };
}

/**
 * Component wrapper để kiểm tra quyền cụ thể
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Component wrapper để kiểm tra quyền tạo mới
 */
export function CreatePermissionGuard({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(`${resource}:create`)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Component wrapper để kiểm tra quyền chỉnh sửa
 */
export function EditPermissionGuard({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(`${resource}:update`)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Component wrapper để kiểm tra quyền xóa
 */
export function DeletePermissionGuard({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(`${resource}:delete`)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
