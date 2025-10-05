"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { PermissionWrapper } from '@/components/auth/PermissionWrapper'
import { canAccessPage, getRoleDescription } from '@/config/permissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  // Nếu không có quyền truy cập (chỉ kiểm tra role và permissions cụ thể)
  if (!hasRoleAccess || !hasPermissionAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-600">
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn không có quyền truy cập vào trang {pageName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-600">
                <p><strong>Role hiện tại:</strong> {getRoleDescription(user.role_name || 'employee')}</p>
                <p><strong>Trang yêu cầu:</strong> {pageName}</p>
                {requiredRole && (
                  <p><strong>Role yêu cầu:</strong> {getRoleDescription(requiredRole)}</p>
                )}
                {requiredPermissions.length > 0 && (
                  <p><strong>Permissions yêu cầu:</strong> {requiredPermissions.join(', ')}</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => router.push(fallbackPath)}
                className="w-full"
              >
                Quay về Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                Quay lại trang trước
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
