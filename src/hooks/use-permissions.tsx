'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { hasPermission, hasRole, isEmployee, hasAnyPermission, hasAllPermissions, canAccessPage } from '@/utils/auth-utils'

// Hook để sử dụng authentication và permissions
export function usePermissions() {
  const { user, loading } = useAuth()

  return {
    user,
    loading,
    // Permission checks
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasRole: (role: string) => hasRole(user, role),
    isEmployee: () => isEmployee(user),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    canAccessPage: (pagePath: string) => canAccessPage(user, pagePath),
    
    // User info
    isAuthenticated: !!user,
    userRole: user?.role_name,
    userPermissions: user?.permissions || [],
    isActive: user?.is_active || false
  }
}

// Hook để kiểm tra permission cụ thể
export function usePermission(permission: string) {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

// Hook để kiểm tra role cụ thể
export function useRole(role: string) {
  const { hasRole } = usePermissions()
  return hasRole(role)
}

// Hook để kiểm tra quyền truy cập trang
export function usePageAccess(pagePath: string) {
  const { canAccessPage } = usePermissions()
  return canAccessPage(pagePath)
}

// Hook để lấy thông tin user hiện tại
export function useCurrentUser() {
  const { user, loading, isAuthenticated, userRole, userPermissions, isActive } = usePermissions()
  
  return {
    user,
    loading,
    isAuthenticated,
    userRole,
    userPermissions,
    isActive,
    // Helper methods
    isAdmin: userRole === 'admin',
    isDirector: userRole === 'director',
    isManager: userRole === 'manager',
    isSales: userRole === 'sales',
    isEngineer: userRole === 'engineer',
    isPurchasing: userRole === 'purchasing',
    isAccountant: userRole === 'accountant'
  }
}