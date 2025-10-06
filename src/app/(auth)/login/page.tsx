"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { COMPANY_CONFIG } from '@/config/company'
import { Loader2, Building2, Shield, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginWithSupabase, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectedFrom = searchParams.get('redirectedFrom') || '/dashboard'

  // Không redirect tự động - để middleware xử lý
  // useEffect(() => {
  //   if (user && !loading) {
  //     window.location.href = '/dashboard'
  //   }
  // }, [user, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (!email.trim()) {
      setError('Vui lòng nhập email')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setIsLoading(false)
      return
    }

    try {
      const result = await loginWithSupabase(email, password)

      if (result.success) {
        // Đợi lâu hơn để AuthProvider xử lý xong và session được thiết lập
        setTimeout(() => {
          console.log('🔄 Redirecting to profile...')
          // Redirect trực tiếp đến profile sau khi login thành công
          window.location.href = '/profile'
        }, 3000) // Tăng từ 1s lên 3s
      } else {
        setError(result.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <Loader2 className="h-8 w-8 auth-loading-spinner" />
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card p-8 w-full max-w-md">
        {/* Company Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="flex items-center space-x-2">
              <Building2 className="h-10 w-10 text-black" />
              <Shield className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <h1 className="auth-title">
            {COMPANY_CONFIG.COMPANY_NAME}
          </h1>
          <p className="auth-subtitle">
            {COMPANY_CONFIG.SYSTEM_DESCRIPTION}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email công ty
              </label>
              <input
                id="email"
                type="email"
                placeholder={COMPANY_CONFIG.LOGIN_PLACEHOLDER}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="auth-input"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="auth-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 auth-loading-spinner" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="auth-footer">
          <div className="auth-footer-text">
            <p>Chỉ dành cho nhân viên công ty {COMPANY_CONFIG.COMPANY_NAME}</p>
            <p className="mt-1">
              Nếu bạn là nhân viên mới, vui lòng liên hệ IT để được cấp tài khoản.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
