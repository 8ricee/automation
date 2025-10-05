"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { User } from '@supabase/supabase-js'

// Extended user interface for employee data
interface EmployeeUser extends User {
  role_name?: string
  permissions?: string[]
  department?: string
  employee_id?: string
}

interface AuthContextType {
  user: EmployeeUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, full_name?: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  isEmployee: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EmployeeUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock employee data for development
  const mockEmployeeData: EmployeeUser = {
    id: 'mock-employee-1',
    email: 'nhanvien@anhmintsc.com',
    role_name: 'manager',
    permissions: ['dashboard:view', 'customers:view', 'customers:create', 'customers:edit', 'products:view', 'products:create', 'products:edit'],
    department: 'Sales',
    employee_id: 'EMP001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {
      full_name: 'Nguyễn Văn A'
    },
    identities: [],
    factors: []
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          // In development, use mock data
          setUser(mockEmployeeData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // In development, use mock data
          setUser(mockEmployeeData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Check if email is from company domain
      if (!email.includes('@anhmintsc.com') && !email.includes('@')) {
        throw new Error('Chỉ nhân viên công ty mới được phép đăng nhập')
      }
      
      await AuthService.signIn({ email, password })
      // Mock successful login in development
      setUser(mockEmployeeData)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, full_name?: string) => {
    try {
      setLoading(true)
      
      // Only allow company email registration
      if (!email.includes('@anhmintsc.com')) {
        throw new Error('Chỉ email công ty mới được phép đăng ký')
      }
      
      await AuthService.signUp({ email, password, full_name })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await AuthService.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    if (!user?.role_name) return false
    return user.role_name.toLowerCase() === role.toLowerCase()
  }

  const isEmployee = (): boolean => {
    return !!user && user.email?.includes('@anhmintsc.com')
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    hasRole,
    isEmployee,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
