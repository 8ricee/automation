"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { PermissionWrapper } from '@/components/auth/PermissionWrapper'
import { canAccessPage, getRoleDescription } from '@/config/permissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface PageGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  pageName: string
  fallbackPath?: string
}

export function PageGuard({ 
  children, 
  requiredPermissions = [],
  requiredRole,
  pageName,
  fallbackPath = '/dashboard'
}: PageGuardProps) {
  const { user, loading, hasPermission } = useAuth()
  const router = useRouter()

  // Redirect về login nếu không có user
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Redirect về dashboard nếu không có quyền truy cập trang
  useEffect(() => {
    if (!loading && user) {
      const hasPageAccess = canAccessPage(user.role_name || 'employee', window.location.pathname)
      
      if (!hasPageAccess) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, loading, router, fallbackPath])

  // Hiển thị loading chỉ khi đang loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  // Nếu không có user, không hiển thị gì (đang redirect)
  if (!user) {
    return null
  }

  // Kiểm tra role cụ thể nếu được yêu cầu
  const hasRoleAccess = !requiredRole || user.role_name === requiredRole || user.role_name === 'admin'
  
  // Kiểm tra permissions cụ thể nếu được yêu cầu
  const hasPermissionAccess = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission))

  // Nếu không có quyền truy cập, redirect về dashboard (không hiển thị giao diện)
  if (!hasRoleAccess || !hasPermissionAccess) {
    router.push(fallbackPath)
    return null
  }

  // Nếu có quyền truy cập, render children với PermissionWrapper
  return (
    <PermissionWrapper 
      requiredPermissions={requiredPermissions}
      requiredRole={requiredRole}
    >
      {children}
    </PermissionWrapper>
  )
}

// Higher-order component để bảo vệ trang
export function withPageGuard<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requiredPermissions?: string[]
    requiredRole?: string
    pageName: string
    fallbackPath?: string
  }
) {
  return function GuardedComponent(props: T) {
    return (
      <PageGuard
        requiredPermissions={options.requiredPermissions}
        requiredRole={options.requiredRole}
        pageName={options.pageName}
        fallbackPath={options.fallbackPath}
      >
        <Component {...props} />
      </PageGuard>
    )
  }
}

// Hook để kiểm tra quyền truy cập trang
export function usePageAccess(pagePath: string) {
  const { user } = useAuth()
  
  const hasAccess = canAccessPage(user?.role_name || 'employee', pagePath)
  
  return {
    hasAccess,
    userRole: user?.role_name || 'employee',
    canAccessPage: (path: string) => canAccessPage(user?.role_name || 'employee', path)
  }
}
