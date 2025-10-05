"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRole,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasRole, isEmployee } = useAuth()
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Timeout sau 5 giây để tránh loading vô hạn
  useEffect(() => {
    const timer = setTimeout(() => {

      setTimeoutReached(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])



  // Nếu loading quá lâu, force render
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  // Force render sau timeout hoặc khi có user
  if (timeoutReached || user) {

    return <>{children}</>
  }

  // Nếu không có user và chưa timeout, hiển thị loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Đang xác thực...</p>
      </div>
    </div>
  )
}

// Higher-order component for protecting pages
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    requiredPermissions?: string[]
    requiredRole?: string
    fallbackPath?: string
  }
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute
        requiredPermissions={options?.requiredPermissions}
        requiredRole={options?.requiredRole}
        fallbackPath={options?.fallbackPath}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
