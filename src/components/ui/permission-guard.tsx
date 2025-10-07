'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionErrorAlert } from '@/components/ui/permission-error-alert'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  showError?: boolean
}

export function PermissionGuard({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null,
  showError = true
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  // Hiển thị loading nếu đang tải
  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-8 rounded"></div>
  }

  // Kiểm tra permission đơn lẻ
  if (permission && !hasPermission(permission)) {
    if (showError) {
      return <PermissionErrorAlert />
    }
    return <>{fallback}</>
  }

  // Kiểm tra nhiều permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasAccess) {
      if (showError) {
        return <PermissionErrorAlert />
      }
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Component wrapper đơn giản cho permission đơn lẻ
export function RequirePermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Component wrapper cho role
export function RequireRole({ 
  role, 
  children, 
  fallback 
}: { 
  role: string
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { hasRole, loading } = usePermissions()

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-8 rounded"></div>
  }

  if (!hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Component wrapper cho authentication
export function RequireAuth({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { isAuthenticated, loading } = usePermissions()

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-8 rounded"></div>
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
