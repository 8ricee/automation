"use client"

import { useRouter } from 'next/navigation'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="auth-container">
      <div className="auth-card p-8 w-full max-w-md">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldX className="h-16 w-16 text-gray-600" />
          </div>
          <h1 className="auth-title text-gray-800">
            Truy cập bị từ chối
          </h1>
          <p className="auth-subtitle">
            Bạn không có quyền truy cập trang này
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="auth-error">
            Trang này chỉ dành cho nhân viên có quyền truy cập phù hợp. 
            Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên hệ thống.
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => router.back()}
              className="auth-button bg-gray-600 hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang trước
            </button>
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="auth-button"
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="auth-footer">
          <div className="auth-footer-text">
            <p>Cần hỗ trợ? Liên hệ: IT Department - Anh Minh Tsc.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
