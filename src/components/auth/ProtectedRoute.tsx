"use client"

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  fallbackPath = '/unauthorized'
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasRole, isEmployee } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is employee
    if (!isEmployee()) {
      router.push('/unauthorized')
      return
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      router.push(fallbackPath)
      return
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission))
      if (!hasAllPermissions) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, loading, requiredPermissions, requiredRole, hasPermission, hasRole, isEmployee, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !isEmployee()) {
    return null
  }

  return <>{children}</>
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
