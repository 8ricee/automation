'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { db } from '@/lib/database'
import { supabaseManager } from '@/utils/supabase'
import { setCookie, getCookie, deleteCookie, clearAllAuthCookies, clearAllStorage } from '@/lib/cookies'
import { getRoleConfigFromDatabase } from "@/config/permissions"
import { hashPassword, verifyPassword, generateSecureToken, sanitizeInput } from '@/lib/security'

interface User {
  id: string
  name: string
  email: string
  position: string
  department: string
  role_id: string
  role_name?: string
  permissions?: string[]
  is_active: boolean
}

interface Employee {
  id: string
  name: string
  email: string
  position: string
  department: string
  role_id: string
  password_hash: string
  is_active: boolean
}

interface Session {
  id: string
  employee_id: string
  session_token: string
  expires_at: string
  is_active: boolean
}

interface Role {
  id: string
  name: string
  description: string
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

interface RolePermission {
  id: string
  role_id: string
  permission_id: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Kiểm tra session hiện tại khi component mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Kiểm tra session token trong cookies
      const sessionToken = getCookie('session_token')
      console.log('AuthProvider - sessionToken:', sessionToken)
      
      if (!sessionToken) {
        console.log('AuthProvider - No session token found')
        setLoading(false)
        return
      }

      // Chỉ set loading khi có session token để kiểm tra
      setLoading(true)
      console.log('AuthProvider - Checking session with token:', sessionToken)

      // Kiểm tra kết nối Supabase trước
      const healthCheck = await supabaseManager.healthCheck()
      const isConnected = healthCheck.status === 'healthy'
      if (!isConnected) {
        console.warn('Supabase not connected, clearing session')
        deleteCookie('session_token')
        setLoading(false)
        return
      }

      // Tìm session trong database
      const sessions = await db.read('user_sessions', {
        session_token: sessionToken,
        is_active: true
      }) as Session[]

      if (sessions.length === 0) {
        deleteCookie('session_token')
        setLoading(false)
        return
      }

      const session = sessions[0]
      
      // Kiểm tra session có hết hạn không
      if (new Date(session.expires_at) < new Date()) {
        // Session hết hạn, xóa session
        await db.update('user_sessions', session.id, { is_active: false })
        deleteCookie('session_token')
        setLoading(false)
        return
      }

      // Lấy thông tin user
      const employees = await db.read('employees', {
        id: session.employee_id,
        is_active: true
      }) as Employee[]

      if (employees.length === 0) {
        deleteCookie('session_token')
        setLoading(false)
        return
      }

      const employee = employees[0]
      
      // Lấy thông tin role và permissions
      const roles = await db.read('roles', { id: employee.role_id }) as Role[]
      const role = roles[0] || null

      // Lấy permissions của role
      let permissions: string[] = []
      if (role) {
        const rolePermissions = await db.read('role_permissions', { role_id: role.id }) as RolePermission[]
        const permissionIds = rolePermissions.map(rp => rp.permission_id)
        
        if (permissionIds.length > 0) {
          const permissionsData = await db.read('permissions', {}) as Permission[]
          permissions = permissionsData
            .filter(p => permissionIds.includes(p.id))
            .map(p => p.name)
        }
      }

      setUser({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role_id: employee.role_id,
        role_name: role?.name,
        permissions,
        is_active: employee.is_active
      })
      
      console.log('AuthProvider - User set successfully:', employee.name, employee.email)

    } catch (error) {
      console.error('Session check error:', error)
      deleteCookie('session_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)

      // Tạm thời disable sanitization để debug
      const sanitizedEmail = email.toLowerCase().trim()
      const sanitizedPassword = password

      console.log('Login attempt:', { email: sanitizedEmail, passwordLength: sanitizedPassword.length })

      // Tìm employee với email
      const employees = await db.read('employees', {
        email: sanitizedEmail,
        is_active: true
      }) as Employee[]

      console.log('Found employees:', employees.length)

      if (employees.length === 0) {
        console.log('No employee found with email:', sanitizedEmail)
        return { success: false, message: 'Email hoặc mật khẩu không đúng' }
      }

      const employee = employees[0]
      console.log('Employee found:', { id: employee.id, name: employee.name, passwordHashLength: employee.password_hash.length })

      // Kiểm tra password - hỗ trợ cả plain text và hashed
      let isPasswordValid = false
      
      if (employee.password_hash.length === 64) {
        // Hashed password
        isPasswordValid = verifyPassword(sanitizedPassword, employee.password_hash)
        console.log('Using hashed password validation')
      } else {
        // Plain text password (legacy)
        isPasswordValid = sanitizedPassword === employee.password_hash
        console.log('Using plain text password validation')
      }
      
      console.log('Password validation:', { 
        isPasswordValid, 
        passwordHashLength: employee.password_hash.length,
        inputPassword: sanitizedPassword,
        storedPassword: employee.password_hash
      })
      
      if (!isPasswordValid) {
        console.log('Password validation failed')
        return { success: false, message: 'Email hoặc mật khẩu không đúng' }
      }

      // Tạo session token với security
      const sessionToken = generateSecureToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Session hết hạn sau 7 ngày

      // Lưu session vào database
      await db.create('user_sessions', {
        employee_id: employee.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: '127.0.0.1', // Trong thực tế nên lấy IP thật
        user_agent: navigator.userAgent,
        is_active: true
      })

      // Cập nhật last_login
      await db.update('employees', employee.id, {
        last_login: new Date().toISOString()
      })

      // Lấy thông tin role và permissions
      const roles = await db.read('roles', { id: employee.role_id }) as Role[]
      const role = roles[0] || null

      // Lưu session token và role vào cookies với debug
      console.log('Setting cookies:', { sessionToken: sessionToken.substring(0, 10) + '...', role: role?.name })
      setCookie('session_token', sessionToken, 7) // 7 ngày
      setCookie('user_role', role?.name || 'employee', 7) // 7 ngày
      
      // Verify cookies were set
      console.log('Cookies after setting:', {
        sessionToken: getCookie('session_token') ? 'set' : 'not set',
        userRole: getCookie('user_role') ? 'set' : 'not set'
      })

      let permissions: string[] = []
      if (role) {
        const rolePermissions = await db.read('role_permissions', { role_id: role.id }) as RolePermission[]
        const permissionIds = rolePermissions.map(rp => rp.permission_id)
        
        if (permissionIds.length > 0) {
          const permissionsData = await db.read('permissions', {}) as Permission[]
          permissions = permissionsData
            .filter(p => permissionIds.includes(p.id))
            .map(p => p.name)
        }
      }

      setUser({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role_id: employee.role_id,
        role_name: role?.name,
        permissions,
        is_active: employee.is_active
      })

      // Ghi audit log
      await db.create('audit_logs', {
        employee_id: employee.id,
        action: 'login',
        resource_type: 'employees',
        resource_id: employee.id,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      })

      return { success: true, message: 'Đăng nhập thành công' }

    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      
      if (user) {
        // Vô hiệu hóa session hiện tại
        const sessionToken = getCookie('session_token')
        console.log('Current session token:', sessionToken ? 'exists' : 'not found')
        
        if (sessionToken) {
          const sessions = await db.read('user_sessions', { session_token: sessionToken }) as Session[]
          if (sessions.length > 0) {
            await db.update('user_sessions', sessions[0].id, { is_active: false })
            console.log('Session deactivated in database')
          }
        }

        // Ghi audit log
        await db.create('audit_logs', {
          employee_id: user.id,
          action: 'logout',
          resource_type: 'employees',
          resource_id: user.id,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        })
        console.log('Audit log created for logout')
      }

      // Force logout - clear everything
      await forceLogout()

    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even on error
      await forceLogout()
    }
  }

  const forceLogout = async () => {
    console.log('Force logout - clearing everything...')
    
    // Clear all storage and cookies
    clearAllStorage()
    
    // Clear React state
    setUser(null)
    
    // Force reload to clear any cached data
    console.log('Force reloading page...')
    window.location.replace('/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false
    
    const hasAccess = user.permissions.includes(permission) || user.permissions.includes('roles:manage')
    
    return hasAccess
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role_name === role || user.role_name === 'admin'
  }

  const refreshUser = async () => {
    if (user) {
      await checkSession()
    }
  }

  // Session token generation đã được chuyển sang security.ts

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUser
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
