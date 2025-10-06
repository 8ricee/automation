import { useAuth } from '@/components/providers/AuthProvider'
import { SYSTEM_PERMISSIONS } from '@/config/permissions'

/**
 * Hook để kiểm tra quyền truy cập trong components
 */
export function usePermissions() {
  const { user, hasPermission } = useAuth()

  return {
    user,
    hasPermission,
    
    // Kiểm tra quyền cụ thể
    canView: (resource: string) => hasPermission(`${resource}:view`),
    canCreate: (resource: string) => hasPermission(`${resource}:create`),
    canEdit: (resource: string) => hasPermission(`${resource}:edit`),
    canDelete: (resource: string) => hasPermission(`${resource}:delete`),
    canApprove: (resource: string) => hasPermission(`${resource}:approve`),
    
    // Kiểm tra quyền cho các module chính
    canManageCustomers: () => hasPermission(SYSTEM_PERMISSIONS.CUSTOMERS_CREATE),
    canManageProducts: () => hasPermission(SYSTEM_PERMISSIONS.PRODUCTS_CREATE),
    canManageOrders: () => hasPermission(SYSTEM_PERMISSIONS.ORDERS_CREATE),
    canManageEmployees: () => hasPermission(SYSTEM_PERMISSIONS.EMPLOYEES_CREATE),
    canManageProjects: () => hasPermission(SYSTEM_PERMISSIONS.PROJECTS_CREATE),
    canManageTasks: () => hasPermission(SYSTEM_PERMISSIONS.TASKS_CREATE),
    canManageQuotes: () => hasPermission(SYSTEM_PERMISSIONS.QUOTES_CREATE),
    canManagePurchasing: () => hasPermission(SYSTEM_PERMISSIONS.PURCHASING_CREATE),
    canManageSuppliers: () => hasPermission(SYSTEM_PERMISSIONS.SUPPLIERS_CREATE),
    canManageFinancials: () => hasPermission(SYSTEM_PERMISSIONS.FINANCIALS_CREATE),
    
    // Kiểm tra quyền chỉnh sửa
    canEditCustomers: () => hasPermission(SYSTEM_PERMISSIONS.CUSTOMERS_EDIT),
    canEditProducts: () => hasPermission(SYSTEM_PERMISSIONS.PRODUCTS_EDIT),
    canEditOrders: () => hasPermission(SYSTEM_PERMISSIONS.ORDERS_EDIT),
    canEditEmployees: () => hasPermission(SYSTEM_PERMISSIONS.EMPLOYEES_EDIT),
    canEditProjects: () => hasPermission(SYSTEM_PERMISSIONS.PROJECTS_EDIT),
    canEditTasks: () => hasPermission(SYSTEM_PERMISSIONS.TASKS_EDIT),
    canEditQuotes: () => hasPermission(SYSTEM_PERMISSIONS.QUOTES_EDIT),
    canEditPurchasing: () => hasPermission(SYSTEM_PERMISSIONS.PURCHASING_EDIT),
    canEditSuppliers: () => hasPermission(SYSTEM_PERMISSIONS.SUPPLIERS_EDIT),
    canEditFinancials: () => hasPermission(SYSTEM_PERMISSIONS.FINANCIALS_EDIT),
    
    // Kiểm tra quyền xóa
    canDeleteCustomers: () => hasPermission(SYSTEM_PERMISSIONS.CUSTOMERS_DELETE),
    canDeleteProducts: () => hasPermission(SYSTEM_PERMISSIONS.PRODUCTS_DELETE),
    canDeleteOrders: () => hasPermission(SYSTEM_PERMISSIONS.ORDERS_DELETE),
    canDeleteEmployees: () => hasPermission(SYSTEM_PERMISSIONS.EMPLOYEES_DELETE),
    canDeleteProjects: () => hasPermission(SYSTEM_PERMISSIONS.PROJECTS_DELETE),
    canDeleteTasks: () => hasPermission(SYSTEM_PERMISSIONS.TASKS_DELETE),
    canDeleteQuotes: () => hasPermission(SYSTEM_PERMISSIONS.QUOTES_DELETE),
    canDeletePurchasing: () => hasPermission(SYSTEM_PERMISSIONS.PURCHASING_DELETE),
    canDeleteSuppliers: () => hasPermission(SYSTEM_PERMISSIONS.SUPPLIERS_DELETE),
    canDeleteFinancials: () => hasPermission(SYSTEM_PERMISSIONS.FINANCIALS_DELETE),
    
    // Kiểm tra quyền phê duyệt
    canApproveOrders: () => hasPermission(SYSTEM_PERMISSIONS.ORDERS_APPROVE),
    canApproveQuotes: () => hasPermission(SYSTEM_PERMISSIONS.QUOTES_APPROVE),
    canApprovePurchasing: () => hasPermission(SYSTEM_PERMISSIONS.PURCHASING_APPROVE),
    canApproveFinancials: () => hasPermission(SYSTEM_PERMISSIONS.FINANCIALS_APPROVE),
    
    // Kiểm tra quyền hệ thống
    isAdmin: () => hasPermission('*') || hasPermission(SYSTEM_PERMISSIONS.SYSTEM_ADMIN),
    canManageRoles: () => hasPermission(SYSTEM_PERMISSIONS.ROLES_MANAGE),
    canViewAnalytics: () => hasPermission(SYSTEM_PERMISSIONS.ANALYTICS_VIEW),
    canExportData: () => hasPermission(SYSTEM_PERMISSIONS.FINANCIALS_EXPORT) || hasPermission(SYSTEM_PERMISSIONS.ANALYTICS_EXPORT),
  }
}

/**
 * Component wrapper để kiểm tra quyền hiển thị
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
  const { canCreate } = usePermissions()
  
  if (!canCreate(resource)) {
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
  const { canEdit } = usePermissions()
  
  if (!canEdit(resource)) {
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
  const { canDelete } = usePermissions()
  
  if (!canDelete(resource)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
