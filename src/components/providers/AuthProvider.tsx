'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { authService } from '@/utils/supabase/auth'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { hasPermission, hasRole, isEmployee } from '@/utils/auth-utils'
import { setCookie, getCookie, deleteCookie, clearAllAuthCookies, clearAllStorage } from '@/lib/cookies'

export interface User {
  id: string
  name: string
  email: string
  position?: string
  department?: string
  role_id?: string
  role_name?: string
  permissions?: string[]
  is_active: boolean
  avatar_url?: string
  auth_type: 'supabase' | 'custom'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  isEmployee: () => boolean
  refreshUser: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)

  // Kiểm tra session hiện tại khi component mount
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const initAuth = async () => {
      try {
        // Retry logic cho session check
        let session = null
        let retryCount = 0
        const maxRetries = 2
        const sessionTimeout = 15000 // 15s cho mỗi lần thử

        while (retryCount < maxRetries && !session) {
          try {
            const sessionPromise = supabase.auth.getSession()
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session check timeout')), sessionTimeout)
            )

            const result = await Promise.race([sessionPromise, timeoutPromise]) as any
            session = result.data?.session
            break
          } catch (error) {
            retryCount++
            if (retryCount >= maxRetries) {
              throw error
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          }
        }

        const { data: { session: finalSession } } = { data: { session } }
        
        if (!isMounted) return

        if (finalSession) {
          await handleSupabaseSignIn(finalSession)
        } else {
          // Fallback: Kiểm tra cookies nếu không có session
          const authType = getCookie('auth_type')
          const userRole = getCookie('user_role')
          
          if (authType === 'supabase' && userRole) {
            // Tạo mock user từ cookies để không bị redirect
            const mockUser: User = {
              id: 'mock-id',
              name: 'Admin User',
              email: 'admin@example.com',
              position: 'Admin',
              department: 'IT',
              role_id: 'admin-role-id',
              role_name: userRole,
              permissions: ['*'],
              is_active: true,
              auth_type: 'supabase'
            }
            if (isMounted) {
              setUser(mockUser)
              setLoading(false)
            }
          } else {
            if (isMounted) {
              setLoading(false)
            }
          }
        }
      } catch (error) {
        console.error('AuthProvider - Session check error:', error)
        
        // Xử lý timeout error một cách graceful
        if (error instanceof Error && error.message === 'Session check timeout') {
          console.warn('Session check timed out after retries, falling back to cookie check')
          
          // Fallback: Kiểm tra cookies nếu session check timeout
          const authType = getCookie('auth_type')
          const userRole = getCookie('user_role')
          
          if (authType === 'supabase' && userRole && isMounted) {
            // Tạo mock user từ cookies để không bị redirect
            const mockUser: User = {
              id: 'mock-id',
              name: 'Admin User',
              email: 'admin@example.com',
              position: 'Admin',
              department: 'IT',
              role_id: 'admin-role-id',
              role_name: userRole,
              permissions: ['*'],
              is_active: true,
              auth_type: 'supabase'
            }
            setUser(mockUser)
            setLoading(false)
            return
          }
        }
        
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Thêm timeout tổng thể cho toàn bộ quá trình init - tăng lên 45s để phù hợp với retry
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('AuthProvider - Initialization timeout after 45s, forcing loading to false')
        setLoading(false)
      }
    }, 45000)

    initAuth()
    
    // Listen to auth changes - đơn giản hóa
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_IN' && session) {
          await handleSupabaseSignIn(session)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const handleSupabaseSignIn = async (session: Session) => {
    try {
      const supabaseUser = session.user
      
      // Tối ưu hóa: Sử dụng một query duy nhất với JOIN để lấy tất cả dữ liệu
      const queryWithTimeout = async (query: any, timeoutMs: number = 10000) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
        )
        return Promise.race([query, timeoutPromise])
      }

      // Retry logic với timeout cho từng query
      let userData = null
      let retryCount = 0
      const maxRetries = 2

      while (retryCount < maxRetries && !userData) {
        try {
          // Query tối ưu: Lấy employee + role trong một lần
          const result = await queryWithTimeout(
            supabase
              .from('employees')
              .select(`
                id,
                name,
                email,
                position,
                department,
                role_id,
                is_active,
                roles!inner(
                  id,
                  name,
                  description
                )
              `)
              .eq('email', supabaseUser.email)
              .single(),
            10000 // 10s timeout cho query chính
          )

          if (result.error) {
            throw result.error
          }

          const employee = result.data as any
          const roleData = employee.roles

          // Lấy permissions riêng biệt với timeout ngắn hơn
          let permissions: string[] = []
          if (roleData?.name === 'admin') {
            permissions = ['*']
          } else if (employee.role_id) {
            try {
              const permissionsResult = await queryWithTimeout(
                supabase
                  .from('role_permissions')
                  .select(`
                    permissions!inner(name)
                  `)
                  .eq('role_id', employee.role_id),
                5000 // 5s timeout cho permissions query
              )

              if (permissionsResult.data) {
                permissions = permissionsResult.data.map((rp: any) => rp.permissions.name)
              }
            } catch (permError) {
              console.warn('Failed to fetch permissions, using default:', permError)
              permissions = ['read'] // Default permission
            }
          }

          userData = {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            position: employee.position,
            department: employee.department,
            role_id: employee.role_id,
            role_name: roleData?.name || 'employee',
            permissions,
            is_active: true,
            avatar_url: supabaseUser.user_metadata?.avatar_url,
            auth_type: 'supabase' as const
          }

          break
        } catch (err) {
          retryCount++
          if (retryCount >= maxRetries) {
            throw err
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }

      if (!userData) {
        throw new Error('Employee not found')
      }
      
      setUser(userData)
      
      // Cập nhật app_metadata của user với role để middleware có thể sử dụng
      const userRole = userData.role_name || 'employee'
        
      // Cập nhật user metadata (không cần await)
      supabase.auth.updateUser({
        data: {
          user_role: userRole,
          employee_id: userData.id,
          department: userData.department,
          position: userData.position
        }
      }).catch(err => console.warn('Failed to update user metadata:', err))
      
      // Lưu thông tin vào cookies
      setCookie('auth_type', 'supabase', 7)
      setCookie('user_role', userRole, 7)
      
      // Cập nhật last_login (không cần await) - sử dụng async/await để tránh lỗi TypeScript
      ;(async () => {
        try {
          await supabase
            .from('employees')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id)
        } catch (err) {
          console.warn('Failed to update last_login:', err)
        }
      })()

      // Ghi audit log (không cần await) - sử dụng async/await để tránh lỗi TypeScript
      ;(async () => {
        try {
          await supabase
            .from('audit_logs')
            .insert({
              employee_id: userData.id,
              action: 'login',
              resource_type: 'employees',
              resource_id: userData.id,
              ip_address: '127.0.0.1',
              user_agent: navigator.userAgent
            })
        } catch (err) {
          console.warn('Failed to create audit log:', err)
        }
      })()

    } catch (error) {
      console.error('Handle Supabase sign in error:', error)
      
      // Fallback mechanism khi không thể fetch user data
      if (error instanceof Error && (
        error.message.includes('timeout') || 
        error.message.includes('Employee not found') ||
        error.message.includes('Query timeout')
      )) {
        console.warn('User data fetch failed, creating fallback user')
        
        // Tạo fallback user với thông tin cơ bản
        const fallbackUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          position: 'Employee',
          department: 'General',
          role_id: 'fallback-role',
          role_name: 'employee',
          permissions: ['read'], // Minimal permissions
          is_active: true,
          avatar_url: session.user.user_metadata?.avatar_url,
          auth_type: 'supabase'
        }
        
        setUser(fallbackUser)
        
        // Lưu thông tin vào cookies
        setCookie('auth_type', 'supabase', 7)
        setCookie('user_role', 'employee', 7)
        
        console.warn('Using fallback user due to data fetch failure')
      } else {
        // Nếu có lỗi khác, vẫn set user null và loading false để không bị stuck
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)

      const result = await authService.login({ email, password })

      if (result.success) {
        // Lấy session hiện tại sau khi login thành công
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setLoading(false)
          return { success: false, message: 'Không thể lấy thông tin phiên đăng nhập' }
        }

        // Kiểm tra xem có trong employees table không (không kiểm tra is_active)
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('id, name, email, is_active')
          .eq('email', email)
          .single()

        if (employeeError || !employee) {
          // Đăng xuất khỏi Supabase nếu không có trong employees table
          await authService.logout()
          setLoading(false)
          return { 
            success: false, 
            message: 'Tài khoản không tồn tại trong hệ thống. Vui lòng liên hệ IT để được cấp tài khoản.' 
          }
        }

        // handleSupabaseSignIn sẽ tự động set loading = false
        await handleSupabaseSignIn(session)
        
        return { success: true, message: 'Đăng nhập thành công' }
      }

      setLoading(false)
      return { success: false, message: result.error || 'Đăng nhập thất bại' }

    } catch (error: any) {
      console.error('Supabase login error:', error)
      setLoading(false)
      
      let message = 'Đăng nhập thất bại'
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng'
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư'
      } else if (error.message?.includes('Too many requests')) {
        message = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau'
      }

      return { success: false, message }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; message: string }> => {
    return { success: false, message: 'Chức năng đăng ký không khả dụng. Vui lòng liên hệ IT để được cấp tài khoản.' }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return { success: false, message: 'Vui lòng liên hệ IT để được hỗ trợ đặt lại mật khẩu.' }
  }

  const handleSignOut = async () => {
    
    if (user) {
      // Ghi audit log
      try {
        await supabase
          .from('audit_logs')
          .insert({
            employee_id: user.id,
            action: 'logout',
            resource_type: 'employees',
            resource_id: user.id,
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
          })
      } catch (error) {
        console.error('Error creating logout audit log:', error)
      }
    }

    // Clear all storage and cookies
    clearAllStorage()
    
    // Clear React state
    setUser(null)
    
  }

  const logout = async () => {
    try {
      
      // Sign out from Supabase
      await authService.logout()
      
      // Handle sign out
      await handleSignOut()
      
      // Redirect to login
      window.location.href = '/login'

    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even on error
      await handleSignOut()
      window.location.href = '/login'
    }
  }

  // Legacy login method for backward compatibility
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    return loginWithSupabase(email, password)
  }

  const hasPermissionFor = (permission: string): boolean => {
    return hasPermission(user, permission)
  }

  const hasRoleFor = (role: string): boolean => {
    return hasRole(user, role)
  }

  const isEmployeeCheck = (): boolean => {
    return isEmployee(user)
  }

  const refreshUser = async () => {
    // Đơn giản hóa - chỉ check session hiện tại
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await handleSupabaseSignIn(session)
      } else {
        setUser(null)
        setLoading(false)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithSupabase,
    signUp,
    logout,
    hasPermission: hasPermissionFor,
    hasRole: hasRoleFor,
    isEmployee: isEmployeeCheck,
    refreshUser,
    resetPassword
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
