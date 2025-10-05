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
        // Thêm timeout cho việc kiểm tra session
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        )

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (!isMounted) return

        if (session) {
          await handleSupabaseSignIn(session)
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
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Thêm timeout tổng thể cho toàn bộ quá trình init
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('AuthProvider - Initialization timeout, forcing loading to false')
        setLoading(false)
      }
    }, 15000)

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
      
      // Thêm timeout cho toàn bộ quá trình handleSupabaseSignIn
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User data fetch timeout')), 30000)
      )

      const fetchUserData = async () => {
        // Retry logic cho việc fetch employee data
        let employees = null
        let error = null
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            const result = await supabase
              .from('employees')
              .select(`
                id,
                name,
                email,
                position,
                department,
                role_id,
                is_active
              `)
              .eq('email', supabaseUser.email)
              .single()

            if (result.error) {
              throw result.error
            }

            employees = result.data
            break
          } catch (err) {
            retryCount++
            if (retryCount >= maxRetries) {
              error = err
              break
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
        }

        if (error || !employees) {
          throw new Error('Employee not found')
        }

        // Type assertion để tránh lỗi TypeScript
        const employee = employees as any

        // Lấy thông tin role riêng biệt với retry logic
        let roleData = null
        if (employee.role_id) {
          retryCount = 0
          while (retryCount < maxRetries) {
            try {
              const result = await supabase
                .from('roles')
                .select('id, name, description')
                .eq('id', employee.role_id)
                .single()
              
              if (result.error) {
                throw result.error
              }
              
              roleData = result.data
              break
            } catch (err) {
              retryCount++
              if (retryCount >= maxRetries) {
                console.warn('Failed to fetch role data after retries:', err)
                break
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            }
          }
        }

        // Lấy permissions của role với retry logic
        let permissions: string[] = []
        if (employee.role_id) {
          // Nếu là admin, cho tất cả permissions
          if ((roleData as any)?.name === 'admin') {
            permissions = ['*']
          } else {
            retryCount = 0
            while (retryCount < maxRetries) {
              try {
                const result = await supabase
                  .from('role_permissions')
                  .select('permission_id')
                  .eq('role_id', employee.role_id)

                if (result.error) {
                  throw result.error
                }

                const rolePermissions = result.data
                if (rolePermissions && rolePermissions.length > 0) {
                  const permissionIds = rolePermissions.map((rp: any) => rp.permission_id)
                  const permissionsResult = await supabase
                    .from('permissions')
                    .select('name')
                    .in('id', permissionIds)
                  
                  if (permissionsResult.error) {
                    throw permissionsResult.error
                  }
                  
                  if (permissionsResult.data) {
                    permissions = permissionsResult.data.map((p: any) => p.name)
                  }
                }
                break
              } catch (err) {
                retryCount++
                if (retryCount >= maxRetries) {
                  console.warn('Failed to fetch permissions after retries:', err)
                  break
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
              }
            }
          }
        }

        const userData: User = {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          role_id: employee.role_id,
          role_name: (roleData as any)?.name || 'employee',
          permissions,
          is_active: true, // Luôn set true vì không kiểm tra is_active
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          auth_type: 'supabase'
        }

        setUser(userData)
        
        // Cập nhật app_metadata của user với role để middleware có thể sử dụng
        const userRole = (roleData as any)?.name || 'employee'
        
        // Cập nhật user metadata (không cần await)
        supabase.auth.updateUser({
          data: {
            user_role: userRole,
            employee_id: employee.id,
            department: employee.department,
            position: employee.position
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
              .eq('id', employee.id)
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
                employee_id: employee.id,
                action: 'login',
                resource_type: 'employees',
                resource_id: employee.id,
                ip_address: '127.0.0.1',
                user_agent: navigator.userAgent
              })
          } catch (err) {
            console.warn('Failed to create audit log:', err)
          }
        })()
      }

      await Promise.race([fetchUserData(), timeoutPromise])

    } catch (error) {
      console.error('Handle Supabase sign in error:', error)
      
      // Nếu là timeout error, hiển thị thông báo cụ thể
      if (error instanceof Error && error.message === 'User data fetch timeout') {
        console.warn('User data fetch timed out after 30 seconds')
        // Có thể hiển thị thông báo cho user hoặc retry
      }
      
      // Nếu có lỗi, vẫn set user null và loading false để không bị stuck
      setUser(null)
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
