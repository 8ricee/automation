"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { checkAccess, createAccessChecker } from '@/utils/auth-utils'
import { canAccessPage } from '@/config/permissions'
import { useRouter } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

export interface AuthGuardProps {
  children: ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  fallbackPath?: string
  renderMode?: 'redirect' | 'fallback'
  fallback?: ReactNode
  pageName?: string
}

/**
 * Unified authentication guard component
 * Thay thế ProtectedRoute, PageGuard và PermissionWrapper
 */
export function AuthGuard({ 
  children, 
  requiredPermissions = [], 
  requiredRole,
  fallbackPath = '/login',
  renderMode = 'redirect',
  fallback = null,
  pageName
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Timeout sau 8 giây để tránh loading vô hạn
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('AuthGuard - Loading timeout reached')
      setTimeoutReached(true)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Redirect về login nếu không có user sau khi loading xong
  useEffect(() => {
    if (!loading && !user && !timeoutReached && renderMode === 'redirect') {
      console.log('AuthGuard - No user found, redirecting to login')
      router.push(fallbackPath)
    }
  }, [user, loading, router, fallbackPath, timeoutReached, renderMode])

  // Redirect về dashboard nếu không có quyền truy cập trang
  useEffect(() => {
    if (!loading && user && pageName && renderMode === 'redirect') {
      const hasPageAccess = canAccessPage(user.role_name || 'employee', window.location.pathname)
      
      if (!hasPageAccess) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, router, pageName, renderMode])

  // Hiển thị loading khi đang loading và chưa timeout
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Hiển thị error nếu timeout và không có user
  if (timeoutReached && !user && renderMode === 'redirect') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không thể xác thực
          </h2>
          <p className="text-gray-600 mb-4">
            Quá trình xác thực mất quá nhiều thời gian. Vui lòng thử lại.
          </p>
          <button
            onClick={() => {
              setTimeoutReached(false)
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Nếu không có user và chưa timeout, hiển thị loading
  if (!user && !timeoutReached && renderMode === 'redirect') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Kiểm tra quyền truy cập
  const hasAccess = checkAccess(user, {
    requiredRole,
    requiredPermissions,
    allowAdmin: true
  })

  // Nếu không có quyền truy cập
  if (!hasAccess) {
    if (renderMode === 'redirect') {
      console.log('AuthGuard - Insufficient permissions, redirecting to dashboard')
      router.push('/dashboard')
      return null
    } else {
      return <>{fallback}</>
    }
  }

  // Nếu có quyền truy cập, render children
  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    requiredPermissions?: string[]
    requiredRole?: string
    fallbackPath?: string
    pageName?: string
  }
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AuthGuard
        requiredPermissions={options?.requiredPermissions}
        requiredRole={options?.requiredRole}
        fallbackPath={options?.fallbackPath}
        pageName={options?.pageName}
        renderMode="redirect"
      >
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * Higher-order component để bảo vệ trang với PageGuard logic
 */
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
      <AuthGuard
        requiredPermissions={options.requiredPermissions}
        requiredRole={options.requiredRole}
        pageName={options.pageName}
        fallbackPath={options.fallbackPath}
        renderMode="redirect"
      >
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * Hook để kiểm tra quyền trong component
 */
export function useRolePermissions() {
  const { user } = useAuth()
  return createAccessChecker(user)
}

/**
 * Hook để kiểm tra quyền truy cập trang
 */
export function usePageAccess(pagePath: string) {
  const { user } = useAuth()
  
  const hasAccess = canAccessPage(user?.role_name || 'employee', pagePath)
  
  return {
    hasAccess,
    userRole: user?.role_name || 'employee',
    canAccessPage: (path: string) => canAccessPage(user?.role_name || 'employee', path)
  }
}

// Export các components cũ để backward compatibility
export const ProtectedRoute = AuthGuard
export const PageGuard = AuthGuard
export const PermissionWrapper = ({ children, fallback, ...props }: AuthGuardProps) => (
  <AuthGuard {...props} renderMode="fallback" fallback={fallback}>
    {children}
  </AuthGuard>
)
