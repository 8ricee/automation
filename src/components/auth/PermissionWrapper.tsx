"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { getRoleConfigFromDatabase } from "@/config/permissions"
import { ReactNode, memo, useMemo } from "react"
import { useOptimizedPermissions } from "@/hooks/useOptimizedPermissions"

interface PermissionWrapperProps {
  children: ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  fallback?: ReactNode
}

export const PermissionWrapper = memo(function PermissionWrapper({ 
  children, 
  requiredPermissions = [],
  requiredRole,
  fallback = null 
}: PermissionWrapperProps) {
  const { user, hasPermission } = useAuth()
  
  const hasAccess = useMemo(() => {
    if (!user) return false
    
    
    // Kiểm tra role nếu được chỉ định
    if (requiredRole && user.role_name?.toLowerCase() !== requiredRole.toLowerCase()) {
      return false
    }
    
    // Kiểm tra permissions nếu được chỉ định
    if (requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every(permission => hasPermission(permission))
      return hasAll
    }
    
    return true
  }, [user, requiredRole, requiredPermissions, hasPermission])
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
})

// Hook để kiểm tra quyền trong component
export function useRolePermissions() {
  const { user, hasPermission } = useAuth()
  
  const hasPermissionFor = (permission: string): boolean => {
    return hasPermission(permission)
  }
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  const hasRole = (role: string): boolean => {
    if (!user?.role_name) return false
    return user.role_name.toLowerCase() === role.toLowerCase()
  }
  
  const getRoleConfig = () => {
    if (!user?.role_name) return null
    return getRoleConfigFromDatabase(user.role_name, user.permissions || [])
  }
  
  return {
    user,
    hasPermission: hasPermissionFor,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getRoleConfig,
    permissions: user?.permissions || [],
    role: user?.role_name || 'employee'
  }
}
