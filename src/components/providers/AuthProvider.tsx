'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { authService } from '@/utils/supabase/auth'
import { Session } from '@supabase/supabase-js'
import { hasPermission, hasRole, isEmployee } from '@/utils/auth-utils'
import { setCookie, clearAllAuthCookies, clearAllStorage } from '@/lib/cookies'

// Giao diện User được mở rộng để chứa trạng thái lỗi
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
  // Thêm thuộc tính error để UI có thể nhận biết và xử lý
  error?: string 
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; message: string }>
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
  // Sử dụng useRef để tránh re-render không cần thiết.
  // Cờ này dùng để ngăn việc xử lý auth chạy đồng thời.
  const isProcessingAuthRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    // Hàm kiểm tra và thiết lập session ban đầu
    const initializeAuth = async () => {
      try {
        // Lấy session một cách đơn giản. Supabase client đủ thông minh để xử lý.
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          setLoading(false)
          return
        }

        if (session) {
          await handleSignIn(session)
        } else {
          // Không có session, đảm bảo mọi thứ sạch sẽ
          clearAllAuthCookies()
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        // Silent error handling
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Lắng nghe sự thay đổi trạng thái xác thực từ Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_IN' && session) {
          await handleSignIn(session)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Hàm xử lý đăng nhập chính, đã được tái cấu trúc để chống silent logout
  const handleSignIn = async (session: Session) => {
    if (isProcessingAuthRef.current) return
    isProcessingAuthRef.current = true

    try {
      const supabaseUser = session.user

      // Đảm bảo email tồn tại
      if (!supabaseUser.email) {
        throw new Error('User email not found in session')
      }

      // Lấy thông tin chi tiết của nhân viên từ bảng 'employees'
      // Sử dụng email thay vì ID vì Supabase auth user ID có thể khác với employee ID
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, email, position, department, role_id, is_active, roles(name)')
        .eq('email', supabaseUser.email) // Sử dụng email để match
        .single()

      if (employeeError) {
        // Ném lỗi để khối catch xử lý, thay vì đăng xuất người dùng
        throw employeeError
      }

      const userData: User = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role_id: employee.role_id,
        role_name: (employee.roles as any)?.name || 'employee',
        permissions: (employee.roles as any)?.name === 'admin' ? ['*'] : ['read'], // Đơn giản hóa permissions
        is_active: employee.is_active,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        auth_type: 'supabase',
      }

      setUser(userData)

      // Thiết lập cookies và thực hiện các tác vụ nền (await để đảm bảo metadata được cập nhật)
      await setupUserSession(userData)

    } catch (error) {
      // Silent error handling
      
      // *** ĐÂY LÀ THAY ĐỔI QUAN TRỌNG NHẤT ***
      // Không đăng xuất người dùng! Tạo một user fallback với thông tin tối thiểu.
      const fallbackUser: User = {
        id: session.user.id,
        email: session.user.email || 'N/A',
        name: session.user.email || 'Unknown User',
        is_active: false,
        auth_type: 'supabase',
        role_name: 'guest',
        permissions: [],
        error: 'Không thể tải thông tin chi tiết tài khoản. Vui lòng thử lại sau.'
      }
      setUser(fallbackUser)
    } finally {
      setLoading(false)
      isProcessingAuthRef.current = false
    }
  }
  
  // Tách các tác vụ nền ra một hàm riêng cho sạch sẽ
  const setupUserSession = async (userData: User) => {
    // 1. Thiết lập cookies
    setCookie('auth_type', 'supabase', 2)
    setCookie('user_role', userData.role_name || 'employee', 2)

    // 2. Cập nhật metadata - QUAN TRỌNG: Phải cập nhật app_metadata, không phải data
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          user_role: userData.role_name || 'employee', 
          employee_id: userData.id,
          role_name: userData.role_name || 'employee'
        }
      })
      
      if (error) {
        // Không throw error để không làm gián đoạn flow
      }
    } catch (err) {
      // Silent error handling
    }

    // 3. Cập nhật last_login (fire-and-forget)
    ;(async () => {
      try {
        await supabase.from('employees').update({ last_login: new Date().toISOString() })
          .eq('id', userData.id)
      } catch (err) {
        // Silent error handling
      }
    })()

    // 4. Ghi audit log (fire-and-forget) - TẠM THỜI DISABLE để tránh lỗi
    // TODO: Sửa schema audit_logs trước khi enable lại
    /*
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      ;(async () => {
        try {
          // Lấy IP thực từ request headers
          const realIP = await fetch('/api/get-ip').then(res => res.text()).catch(() => 'unknown')
          
          await supabase
            .from('audit_logs')
            .insert({
              employee_id: userData.id,
              action: 'login',
              resource_type: 'employees',
              resource_id: userData.id,
              ip_address: realIP,
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            })
        } catch (err) {
          // Silent error handling
        }
      })()
    }
    */
  }

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true)
    try {
      const { success, error: authError } = await authService.login({ email, password })

      if (!success) {
        throw new Error(authError || 'Đăng nhập thất bại')
      }
      
      // Sau khi login thành công, onAuthStateChange sẽ tự động kích hoạt handleSignIn
      // không cần gọi thủ công ở đây để tránh race condition.
      return { success: true, message: 'Đăng nhập thành công' }
    } catch (error: any) {
      setLoading(false)
      let message = 'Đăng nhập thất bại'
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Email hoặc mật khẩu không đúng'
      }
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      // Ghi audit log cho logout - TẠM THỜI DISABLE để tránh lỗi
      // TODO: Sửa schema audit_logs trước khi enable lại
      /*
      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const realIP = await fetch('/api/get-ip').then(res => res.text()).catch(() => 'unknown')
          
          await supabase
            .from('audit_logs')
            .insert({
              employee_id: user.id,
              action: 'logout',
              resource_type: 'employees',
              resource_id: user.id,
              ip_address: realIP,
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            })
        } catch (error) {
          // Silent error handling
        }
      }
      */

      // Đảm bảo xóa session trước khi clear storage
      await authService.logout()
      
      // Xóa tất cả storage và cookies
      clearAllStorage()
      
      // Reset state ngay lập tức
      setUser(null)
      setLoading(false)
      
      // Redirect về login
      window.location.href = '/login'
    } catch (error) {
      // Ngay cả khi có lỗi, vẫn phải đảm bảo logout
      console.error('Logout error:', error)
      clearAllStorage()
      setUser(null)
      setLoading(false)
      window.location.href = '/login'
    }
  }

  // Hàm refresh đơn giản, chỉ cần kích hoạt lại việc kiểm tra session
  const refreshUser = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await handleSignIn(session)
    } else {
      setUser(null)
      setLoading(false)
    }
  }

  // Các hàm này không thay đổi vì phụ thuộc vào yêu cầu nghiệp vụ
  const signUp = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; message: string }> => {
    return { success: false, message: 'Chức năng đăng ký không khả dụng. Vui lòng liên hệ IT.' }
  }
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return { success: false, message: 'Vui lòng liên hệ IT để đặt lại mật khẩu.' }
  }

  const value: AuthContextType = {
    user,
    loading,
    loginWithSupabase,
    logout,
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasRole: (role: string) => hasRole(user, role),
    isEmployee: () => isEmployee(user),
    refreshUser,
    resetPassword
  }

  // Hiển thị loading screen khi đang xử lý auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
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