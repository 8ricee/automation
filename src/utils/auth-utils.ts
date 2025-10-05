// Utility functions for authentication and authorization
import { User } from '@/components/providers/AuthProvider'

export interface AccessCheckOptions {
  requiredRole?: string
  requiredPermissions?: string[]
  allowAdmin?: boolean
}

/**
 * Kiểm tra quyền truy cập của user
 */
export function checkAccess(
  user: User | null, 
  options: AccessCheckOptions = {}
): boolean {
  const { requiredRole, requiredPermissions = [], allowAdmin = true } = options
  
  if (!user) return false
  
  // Kiểm tra role
  if (requiredRole) {
    const hasRole = user.role_name === requiredRole || 
                   (allowAdmin && user.role_name === 'admin')
    if (!hasRole) return false
  }
  
  // Kiểm tra permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(user, permission)
    )
    if (!hasAllPermissions) return false
  }
  
  return true
}

/**
 * Kiểm tra user có permission cụ thể không
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false
  
  // Nếu có '*' thì có tất cả permissions
  if (user.permissions.includes('*')) {
    return true
  }
  
  return user.permissions.includes(permission) || 
         user.permissions.includes('roles:manage')
}

/**
 * Kiểm tra user có role cụ thể không
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false
  return user.role_name === role || user.role_name === 'admin'
}

/**
 * Kiểm tra user có bất kỳ permission nào trong danh sách không
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false
  
  if (user.permissions.includes('*')) return true
  
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Kiểm tra user có tất cả permissions trong danh sách không
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false
  
  if (user.permissions.includes('*')) return true
  
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Kiểm tra user có phải là employee không
 */
export function isEmployee(user: User | null): boolean {
  return user !== null
}

/**
 * Lấy role config từ database
 */
export function getRoleConfig(user: User | null) {
  if (!user?.role_name) return null
  
  // Import dynamic để tránh circular dependency
  const { getRoleConfigFromDatabase } = require('@/config/permissions')
  return getRoleConfigFromDatabase(user.role_name, user.permissions || [])
}

/**
 * Utility để tạo access check function với user context
 */
export function createAccessChecker(user: User | null) {
  return {
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasRole: (role: string) => hasRole(user, role),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    isEmployee: () => isEmployee(user),
    checkAccess: (options: AccessCheckOptions) => checkAccess(user, options),
    getRoleConfig: () => getRoleConfig(user),
    permissions: user?.permissions || [],
    role: user?.role_name || 'employee'
  }
}
