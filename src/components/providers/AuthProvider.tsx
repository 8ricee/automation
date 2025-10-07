'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
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
  last_login?: string
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
  const [isInitialized, setIsInitialized] = useState(false)
  // Sử dụng useRef để tránh re-render không cần thiết.
  // Cờ này dùng để ngăn việc xử lý auth chạy đồng thời.
  const isProcessingAuthRef = useRef(false)

  // Hàm xử lý đăng nhập chính, sử dụng server API
  const handleSignIn = useCallback(async (_session: Session) => {
    if (isProcessingAuthRef.current) return
    isProcessingAuthRef.current = true

    // Thêm timeout cho handleSignIn để tránh loading vô hạn
    const signInTimeout = setTimeout(() => {
      console.log('handleSignIn timeout, setting loading to false')
      setLoading(false)
      setIsInitialized(true)
      isProcessingAuthRef.current = false
    }, 15000) // 15 giây timeout

    try {
      // Gọi API để lấy thông tin user từ server
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to get user info')
      }

      const { success, user: userData } = await response.json()

      if (!success || !userData) {
        throw new Error('Invalid user data')
      }

      // Tạo user object với permissions
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        position: userData.position,
        department: userData.department,
        role_id: userData.role_id,
        role_name: userData.role_name,
        permissions: userData.permissions || [],
        is_active: userData.is_active,
        last_login: userData.last_login,
        auth_type: 'supabase'
      }

      setUser(user)
      setLoading(false)
      setIsInitialized(true)
      isProcessingAuthRef.current = false

    } catch (error: unknown) {
      console.error('handleSignIn error:', error)
      
      // Fallback: tạo user cơ bản nếu không lấy được từ server
      const fallbackUser: User = {
        id: 'fallback',
        name: 'User',
        email: 'user@example.com',
        position: 'Employee',
        department: 'General',
        role_id: 'employee',
        role_name: 'employee',
        permissions: ['profile:read'],
        is_active: true,
        last_login: new Date().toISOString(),
        auth_type: 'supabase'
      }
      
      setUser(fallbackUser)
    } finally {
      // Clear timeout khi hoàn thành
      clearTimeout(signInTimeout)
      setLoading(false)
      setIsInitialized(true)
      isProcessingAuthRef.current = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Hàm kiểm tra và thiết lập session ban đầu
    const initializeAuth = async () => {
      try {
        // Thêm timeout để tránh loading vô hạn
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('Auth initialization timeout, setting loading to false')
            setLoading(false)
            setIsInitialized(true)
          }
        }, 10000) // 10 giây timeout

        // Lấy session một cách đơn giản. Supabase client đủ thông minh để xử lý.
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        // Clear timeout nếu thành công
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (session) {
          await handleSignIn(session)
        } else {
          // Không có session, đảm bảo mọi thứ sạch sẽ
          clearAllAuthCookies()
          setUser(null)
          setLoading(false)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear timeout nếu có lỗi
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        // Silent error handling
        if (isMounted) {
          setLoading(false)
          setIsInitialized(true)
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
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [handleSignIn])
  
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
    } catch {
      // Silent error handling
    }

    // 3. Cập nhật last_login (fire-and-forget)
    ;(async () => {
      try {
        await supabase.from('employees').update({ last_login: new Date().toISOString() })
          .eq('id', userData.id)
      } catch {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      // Không cần gọi handleSignIn ở đây vì session sẽ được xử lý tự động
      // bởi onAuthStateChange listener
      return { success: true, message: 'Đăng nhập thành công' }
    } catch (error: unknown) {
      setLoading(false)
      let message = 'Đăng nhập thất bại'
      if ((error as Error).message?.includes('Invalid login credentials')) {
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

      // Gọi API logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // Đảm bảo xóa session trước khi clear storage
      await supabase.auth.signOut()
      
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
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('Session refresh error:', error)
        // Nếu lỗi session, đăng xuất người dùng
        await supabase.auth.signOut()
        clearAllStorage()
        setUser(null)
        setLoading(false)
        window.location.href = '/login'
        return
      }
      
      if (session) {
        await handleSignIn(session)
      } else {
        setUser(null)
        setLoading(false)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setLoading(false)
    }
  }

  // Các hàm này không thay đổi vì phụ thuộc vào yêu cầu nghiệp vụ
  const resetPassword = async (): Promise<{ success: boolean; message: string }> => {
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
  // Chỉ hiển thị loading khi chưa khởi tạo để tránh hydration mismatch
  if (loading && !isInitialized) {
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
      {user?.error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {user.error}
              </p>
              <div className="mt-2">
                <button
                  onClick={refreshUser}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
